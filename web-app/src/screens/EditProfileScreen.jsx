import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiFileText, FiCamera, FiCheck, FiX } from 'react-icons/fi';

const EditProfileScreen = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    nationalId: '',
    nationalIdImage: null,
    profileImage: null
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [previewIdImage, setPreviewIdImage] = useState(null);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phoneNumber || '',
        email: user.email || '',
        nationalId: user.nationalId || '',
        nationalIdImage: null,
        profileImage: null
      });
    } else {
      // Mock data for demo
      setFormData({
        name: 'John Doe',
        phone: '+255744123456',
        email: 'john.doe@example.com',
        nationalId: '',
        nationalIdImage: null,
        profileImage: null
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'profileImage') {
          setPreviewProfileImage(reader.result);
        } else if (name === 'nationalIdImage') {
          setPreviewIdImage(reader.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.nationalId && !/^[A-Za-z0-9-]{5,20}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'Invalid ID format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        position: "top-right",
        theme: "dark"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would call an API to update the profile
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock update function
      // In a real app, you would implement updateUserProfile in the AuthContext
      if (typeof updateUserProfile === 'function') {
        await updateUserProfile({
          name: formData.name,
          phoneNumber: formData.phone,
          email: formData.email,
          nationalId: formData.nationalId,
          // In a real app, you would upload these files to a server
          // and store the URLs
        });
      }
      
      // Save to localStorage for demo purposes
      const userData = {
        name: formData.name,
        phoneNumber: formData.phone,
        email: formData.email,
        nationalId: formData.nationalId,
        kycVerified: formData.nationalId && formData.nationalIdImage ? true : false
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      toast.success('Profile updated successfully!', {
        position: "top-right",
        theme: "dark"
      });
      
      navigate('/settings');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.', {
        position: "top-right",
        theme: "dark"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background-dark text-text-primary pb-16">
      {/* Header */}
      <header className="wallet-header" style={{ paddingBottom: 'var(--spacing-md)' }}>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/settings')} 
            className="mr-3 btn-icon btn-secondary"
            disabled={loading}
          >
            <FiX className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
      </header>

      <div className="flex-1 p-4">
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {previewProfileImage ? (
                  <img src={previewProfileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="h-12 w-12 text-primary" />
                )}
              </div>
              <label htmlFor="profileImage" className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer">
                <FiCamera className="text-white h-4 w-4" />
                <input 
                  type="file" 
                  id="profileImage" 
                  name="profileImage" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            </div>
            <p className="text-sm text-text-secondary mt-2">Tap to change profile photo</p>
          </div>
          
          {/* Personal Information */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-background-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${errors.name ? 'border border-error' : 'border border-transparent'}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-text-secondary" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-background-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${errors.phone ? 'border border-error' : 'border border-transparent'}`}
                    placeholder="+255 XXX XXX XXX"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-text-secondary" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-background-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${errors.email ? 'border border-error' : 'border border-transparent'}`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
              </div>
            </div>
          </div>
          
          {/* KYC Information */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">KYC Verification</h3>
            <p className="text-sm text-text-secondary mb-4">
              To comply with regulations and enhance security, please provide your National ID information.
            </p>
            
            <div className="space-y-4">
              {/* National ID Number */}
              <div>
                <label htmlFor="nationalId" className="block text-sm font-medium text-text-secondary mb-1">National ID Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFileText className="text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    id="nationalId"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 bg-background-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none ${errors.nationalId ? 'border border-error' : 'border border-transparent'}`}
                    placeholder="Enter your National ID number"
                  />
                </div>
                {errors.nationalId && <p className="mt-1 text-sm text-error">{errors.nationalId}</p>}
              </div>
              
              {/* National ID Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">National ID Image</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                  {previewIdImage ? (
                    <div className="relative">
                      <img src={previewIdImage} alt="ID Preview" className="max-h-48 mx-auto rounded-lg" />
                      <button 
                        type="button"
                        onClick={() => {
                          setPreviewIdImage(null);
                          setFormData(prev => ({ ...prev, nationalIdImage: null }));
                        }}
                        className="absolute top-2 right-2 bg-error rounded-full p-1"
                      >
                        <FiX className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="nationalIdImage" className="cursor-pointer flex flex-col items-center justify-center py-4">
                        <FiCamera className="h-10 w-10 text-text-secondary mb-2" />
                        <span className="text-sm text-text-secondary">Click to upload ID image</span>
                        <span className="text-xs text-text-muted mt-1">(Front side of your National ID)</span>
                      </label>
                      <input 
                        type="file" 
                        id="nationalIdImage" 
                        name="nationalIdImage" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark border-t border-gray-800">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Profile...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiCheck className="mr-2" />
                  Save Changes
                </span>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default EditProfileScreen;
