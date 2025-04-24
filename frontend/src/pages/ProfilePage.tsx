import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Edit2, Save, X, Eye, EyeOff, ChevronDown, ChevronRight, User, Camera, Loader2 } from 'lucide-react';
import { updateUserProfile, updateUserPassword, updateUserPreferences } from '@/services/user.service';
import { uploadFileToS3 } from '@/services/article.service';
import { setUser } from '@/features/auth/authSlice';
import { RootState } from '@/app/store';
import { Category, PasswordFormData, ProfileFormData } from '@/interfaces/userInterface';
import { getCategories } from '@/services/auth.service';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { profileUpdateSchema } from '@/validations/registerSchema';



export const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    profileImage: user?.profileImage || '',
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPreferences, setShowPreferences] = useState(true);
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [showSecurity, setShowSecurity] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImage || null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    user?.preferences?.map((pref: any) => typeof pref === 'string' ? pref : pref._id) || []
  );

  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    preferences: false,
    categories: false,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    fetchCategories();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (categoryId: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      try {
        setImageLoading(true);
        const imageUrl = await uploadFileToS3(file);
        
        setProfileData(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
        
        await handleImageSubmit(imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload profile image');
        setPreviewUrl(user?.profileImage || null);
      } finally {
        setImageLoading(false);
      }
    }
  };

  const handleImageSubmit = async (imageUrl: string) => {
    try {
      const response = await updateUserProfile({
        ...profileData,
        profileImage: imageUrl
      });
      
      if (response.user) {
        dispatch(setUser(response.user));
        toast.success('Profile image updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setValidationErrors({});
      
      profileUpdateSchema.parse(profileData);
      setLoading(prev => ({ ...prev, profile: true }));
      const response = await updateUserProfile(profileData);
      
      if (response.user) {
        dispatch(setUser(response.user));
        toast.success('Profile updated successfully');
        setEditMode(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });
        setValidationErrors(errors);
        toast.error('Please correct the errors in the form');
      } else {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      }
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, password: true }));
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordMode(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handlePreferencesSubmit = async () => {
    try {
      if (!user) {
        toast.error('User not logged in');
        return;
      }
      setLoading(prev => ({ ...prev, preferences: true }));
      const response = await updateUserPreferences({ preferences: selectedPreferences });
      
      if (response.preferences) {
        dispatch(
          setUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            preferences: response.preferences,
            profileImage: user.profileImage,
          })
        );
        toast.success('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getUserInitials = () => {
    return `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;
  };

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border mb-8">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden relative cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                {imageLoading && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                    <span className="text-3xl sm:text-5xl font-medium text-primary">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-muted p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
              <p className="text-muted-foreground mt-1">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-2">{user?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2">
          {/* Personal Information Section */}
          <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border mb-8">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setShowPersonalInfo(!showPersonalInfo)}
            >
              <h2 className="text-xl font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </h2>
              {showPersonalInfo ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            
            {showPersonalInfo && (
              <div className="p-6">
                <form onSubmit={handleProfileSubmit}>
                  <div className="flex justify-end mb-4">
                    <button 
                      type="button"
                      onClick={() => setEditMode(!editMode)}
                      className={`flex items-center text-sm px-3 py-1.5 rounded-md transition-colors ${
                        editMode ? 'bg-muted' : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {editMode ? (
                        <>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4 mr-1" /> Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            className={`w-full px-3 py-2 border ${
                              validationErrors.firstName ? 'border-red-500' : 'border-border'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                            required
                          />
                          {validationErrors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">{profileData.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      {editMode ? (
                        <>
                          <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            className={`w-full px-3 py-2 border ${
                              validationErrors.lastName ? 'border-red-500' : 'border-border'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                            required
                          />
                          {validationErrors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">{profileData.lastName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      {editMode ? (
                        <input
                          type="email"
                          name="email"
                          readOnly
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-border rounded-md bg-muted cursor-not-allowed"
                          required
                        />
                      ) : (
                        <p className="text-muted-foreground">{profileData.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      {editMode ? (
                        <>
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className={`w-full px-3 py-2 border ${
                              validationErrors.phone ? 'border-red-500' : 'border-border'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                            required
                          />
                          {validationErrors.phone && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">{profileData.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Date of Birth</label>
                      {editMode ? (
                        <>
                          <input
                            type="date"
                            name="dob"
                            value={profileData.dob}
                            onChange={handleProfileChange}
                            className={`w-full px-3 py-2 border ${
                              validationErrors.dob ? 'border-red-500' : 'border-border'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50`}
                            required
                          />
                          {validationErrors.dob && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.dob}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          {profileData.dob ? formatDate(profileData.dob) : 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {editMode && (
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading.profile}
                        className="flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading.profile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
          
          {/* Security Section */}
          <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setShowSecurity(!showSecurity)}
            >
              <h2 className="text-xl font-semibold flex items-center">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security
              </h2>
              {showSecurity ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            
            {showSecurity && (
              <div className="p-6">
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={() => setPasswordMode(!passwordMode)}
                    className={`flex items-center text-sm px-3 py-1.5 rounded-md transition-colors ${
                      passwordMode ? 'bg-muted' : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {passwordMode ? (
                      <>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-1" /> Change Password
                      </>
                    )}
                  </button>
                </div>
                
                {passwordMode ? (
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading.password}
                        className="flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading.password ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-accent/10 p-4 rounded-md">
                    <p className="text-sm">You can change your password</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setShowPreferences(!showPreferences)}
            >
              <h2 className="text-xl font-semibold flex items-center">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Article Preferences
              </h2>
              {showPreferences ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            
            {showPreferences && (
              <div className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Select categories you're interested in to personalize your feed
                </p>
                
                {loading.categories ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-96 mb-6">
                      {categories.map(category => (
                        <div 
                          key={category._id}
                          className={`p-3 rounded-md cursor-pointer transition-colors flex items-center ${
                            selectedPreferences.includes(category._id) 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'bg-accent/10 hover:bg-accent/20 border border-transparent'
                          }`}
                          onClick={() => handlePreferenceToggle(category._id)}
                        >
                          <div className={`h-4 w-4 rounded mr-3 flex-shrink-0 ${
                            selectedPreferences.includes(category._id) 
                              ? 'bg-primary' 
                              : 'border border-muted-foreground'
                          }`}>
                            {selectedPreferences.includes(category._id) && (
                              <svg className="h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            {category.description && (
                              <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handlePreferencesSubmit}
                      disabled={loading.preferences}
                      className="w-full px-4 py-2 bg-primary text-background rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading.preferences ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};