// Application Form Builder - Custom job application form creation for employers
// Drag-and-drop form builder with conditional logic and custom field types

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit, Save, Eye, Copy, Move, Settings, ArrowUp, ArrowDown,
  Type, AlignLeft, List, CheckSquare, Calendar, Upload, Phone, Mail,
  Hash, Globe, MapPin, Star, ToggleLeft, Image, FileText, Users,
  Zap, Code, Layers, Target, ChevronDown, ChevronRight, AlertCircle
} from 'lucide-react';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const ApplicationFormBuilder = ({ jobId, onNavigate, currentUser }) => {
  const { getText } = useTeReo();
  
  const [formConfig, setFormConfig] = useState({
    id: '',
    jobId: jobId || '',
    title: 'Job Application Form',
    description: 'Please fill out this form to apply for the position.',
    fields: [],
    settings: {
      allowSave: true,
      showProgress: true,
      requireSignIn: true,
      multiPage: false,
      theme: 'default'
    },
    notifications: {
      confirmationEmail: true,
      adminNotification: true,
      customMessage: ''
    }
  });

  const [draggedField, setDraggedField] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFieldSettings, setShowFieldSettings] = useState(false);

  // Field Types Configuration
  const fieldTypes = [
    {
      type: 'text',
      icon: Type,
      label: 'Short Text',
      description: 'Single line text input',
      defaultConfig: { placeholder: 'Enter text...', maxLength: 100, required: false }
    },
    {
      type: 'textarea',
      icon: AlignLeft,
      label: 'Long Text',
      description: 'Multi-line text area',
      defaultConfig: { placeholder: 'Enter detailed text...', rows: 4, maxLength: 1000, required: false }
    },
    {
      type: 'email',
      icon: Mail,
      label: 'Email',
      description: 'Email address field',
      defaultConfig: { placeholder: 'email@example.com', required: true }
    },
    {
      type: 'phone',
      icon: Phone,
      label: 'Phone Number',
      description: 'Phone number input',
      defaultConfig: { placeholder: '+64 21 123 4567', required: false }
    },
    {
      type: 'number',
      icon: Hash,
      label: 'Number',
      description: 'Numeric input field',
      defaultConfig: { placeholder: '0', min: 0, max: 999999, required: false }
    },
    {
      type: 'select',
      icon: List,
      label: 'Dropdown',
      description: 'Single selection dropdown',
      defaultConfig: { 
        options: ['Option 1', 'Option 2', 'Option 3'], 
        placeholder: 'Select an option...',
        required: false 
      }
    },
    {
      type: 'multiselect',
      icon: CheckSquare,
      label: 'Multiple Choice',
      description: 'Multiple selection checkboxes',
      defaultConfig: { 
        options: ['Option 1', 'Option 2', 'Option 3'], 
        required: false,
        maxSelections: null
      }
    },
    {
      type: 'radio',
      icon: ToggleLeft,
      label: 'Radio Buttons',
      description: 'Single selection radio buttons',
      defaultConfig: { 
        options: ['Yes', 'No', 'Maybe'], 
        required: false,
        layout: 'vertical'
      }
    },
    {
      type: 'date',
      icon: Calendar,
      label: 'Date',
      description: 'Date picker field',
      defaultConfig: { required: false, minDate: '', maxDate: '' }
    },
    {
      type: 'file',
      icon: Upload,
      label: 'File Upload',
      description: 'File upload field',
      defaultConfig: { 
        acceptedTypes: ['.pdf', '.doc', '.docx'], 
        maxSize: 10,
        multiple: false,
        required: false
      }
    },
    {
      type: 'rating',
      icon: Star,
      label: 'Rating',
      description: 'Star rating input',
      defaultConfig: { stars: 5, required: false, label: 'Rate your experience' }
    },
    {
      type: 'url',
      icon: Globe,
      label: 'Website URL',
      description: 'URL input field',
      defaultConfig: { placeholder: 'https://example.com', required: false }
    },
    {
      type: 'section',
      icon: Layers,
      label: 'Section Break',
      description: 'Visual section separator',
      defaultConfig: { title: 'Section Title', description: '' }
    }
  ];

  useEffect(() => {
    if (jobId) {
      loadFormConfig();
    }
  }, [jobId]);

  const loadFormConfig = async () => {
    try {
      const formRef = doc(db, 'applicationForms', jobId);
      const formSnap = await getDoc(formRef);
      
      if (formSnap.exists()) {
        setFormConfig(formSnap.data());
      } else {
        // Create default form with basic fields
        const defaultForm = {
          ...formConfig,
          id: jobId,
          jobId: jobId,
          fields: [
            {
              id: 'personal_info',
              type: 'section',
              config: { title: 'Personal Information', description: 'Tell us about yourself' }
            },
            {
              id: 'full_name',
              type: 'text',
              label: 'Full Name',
              config: { placeholder: 'Enter your full name', required: true }
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email Address',
              config: { placeholder: 'your@email.com', required: true }
            },
            {
              id: 'phone',
              type: 'phone',
              label: 'Phone Number',
              config: { placeholder: '+64 21 123 4567', required: true }
            },
            {
              id: 'experience_section',
              type: 'section',
              config: { title: 'Experience & Qualifications', description: 'Your professional background' }
            },
            {
              id: 'cv_upload',
              type: 'file',
              label: 'CV/Resume',
              config: { 
                acceptedTypes: ['.pdf', '.doc', '.docx'],
                maxSize: 10,
                required: true
              }
            },
            {
              id: 'cover_letter',
              type: 'textarea',
              label: 'Cover Letter',
              config: { 
                placeholder: 'Tell us why you are perfect for this role...',
                rows: 6,
                maxLength: 2000,
                required: true
              }
            }
          ]
        };
        setFormConfig(defaultForm);
      }
    } catch (error) {
      console.error('Error loading form config:', error);
    }
  };

  const saveFormConfig = async () => {
    try {
      setIsSaving(true);
      const formRef = doc(db, 'applicationForms', jobId);
      await setDoc(formRef, {
        ...formConfig,
        updatedAt: new Date(),
        updatedBy: currentUser?.uid
      });
      
      console.log('Form configuration saved successfully');
    } catch (error) {
      console.error('Error saving form config:', error);
      alert('Failed to save form configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const addField = (fieldType) => {
    const fieldConfig = fieldTypes.find(f => f.type === fieldType);
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: fieldConfig.label,
      config: { ...fieldConfig.defaultConfig },
      order: formConfig.fields.length,
      conditional: null
    };

    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (fieldId) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const moveField = (fieldId, direction) => {
    const fieldIndex = formConfig.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newFields = [...formConfig.fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];
      
      setFormConfig(prev => ({
        ...prev,
        fields: newFields
      }));
    }
  };

  const duplicateField = (fieldId) => {
    const field = formConfig.fields.find(f => f.id === fieldId);
    if (!field) return;

    const duplicatedField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`
    };

    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, duplicatedField]
    }));
  };

  const renderFieldIcon = (type) => {
    const fieldType = fieldTypes.find(f => f.type === type);
    if (!fieldType) return <Type size={16} />;
    
    const Icon = fieldType.icon;
    return <Icon size={16} />;
  };

  const renderFieldSettings = () => {
    if (!selectedField) return null;

    const fieldType = fieldTypes.find(f => f.type === selectedField.type);

    return (
      <div className="bg-white border-l border-gray-200 w-80 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Field Settings</h3>
          <button
            onClick={() => setShowFieldSettings(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Field Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
            <input
              type="text"
              value={selectedField.label}
              onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Field Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <input
              type="text"
              value={selectedField.description || ''}
              onChange={(e) => updateField(selectedField.id, { description: e.target.value })}
              placeholder="Help text for this field"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Required Field */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedField.config?.required || false}
              onChange={(e) => updateField(selectedField.id, {
                config: { ...selectedField.config, required: e.target.checked }
              })}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Required field</label>
          </div>

          {/* Type-specific settings */}
          {selectedField.type === 'text' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={selectedField.config?.placeholder || ''}
                  onChange={(e) => updateField(selectedField.id, {
                    config: { ...selectedField.config, placeholder: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                <input
                  type="number"
                  value={selectedField.config?.maxLength || 100}
                  onChange={(e) => updateField(selectedField.id, {
                    config: { ...selectedField.config, maxLength: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          {(selectedField.type === 'select' || selectedField.type === 'multiselect' || selectedField.type === 'radio') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              <div className="space-y-2">
                {(selectedField.config?.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(selectedField.config?.options || [])];
                        newOptions[index] = e.target.value;
                        updateField(selectedField.id, {
                          config: { ...selectedField.config, options: newOptions }
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => {
                        const newOptions = [...(selectedField.config?.options || [])];
                        newOptions.splice(index, 1);
                        updateField(selectedField.id, {
                          config: { ...selectedField.config, options: newOptions }
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(selectedField.config?.options || []), 'New Option'];
                    updateField(selectedField.id, {
                      config: { ...selectedField.config, options: newOptions }
                    });
                  }}
                  className="text-green-600 hover:text-green-700 text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {selectedField.type === 'file' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accepted File Types</label>
                <input
                  type="text"
                  value={(selectedField.config?.acceptedTypes || []).join(', ')}
                  onChange={(e) => updateField(selectedField.id, {
                    config: { 
                      ...selectedField.config, 
                      acceptedTypes: e.target.value.split(',').map(s => s.trim()) 
                    }
                  })}
                  placeholder=".pdf, .doc, .docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                <input
                  type="number"
                  value={selectedField.config?.maxSize || 10}
                  onChange={(e) => updateField(selectedField.id, {
                    config: { ...selectedField.config, maxSize: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          {selectedField.type === 'section' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={selectedField.config?.title || ''}
                  onChange={(e) => updateField(selectedField.id, {
                    config: { ...selectedField.config, title: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                <textarea
                  value={selectedField.config?.description || ''}
                  onChange={(e) => updateField(selectedField.id, {
                    config: { ...selectedField.config, description: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderFormPreview = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{formConfig.title}</h2>
          <p className="text-gray-600">{formConfig.description}</p>
        </div>

        <div className="space-y-6">
          {formConfig.fields.map((field) => (
            <div key={field.id}>
              {field.type === 'section' ? (
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900">{field.config?.title}</h3>
                  {field.config?.description && (
                    <p className="text-gray-600 mt-1">{field.config.description}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.config?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.description && (
                    <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.config?.placeholder}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      rows={field.config?.rows || 4}
                      placeholder={field.config?.placeholder}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}

                  {field.type === 'email' && (
                    <input
                      type="email"
                      placeholder={field.config?.placeholder}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}

                  {field.type === 'select' && (
                    <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <option>{field.config?.placeholder || 'Select an option...'}</option>
                      {(field.config?.options || []).map((option, index) => (
                        <option key={index}>{option}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'multiselect' && (
                    <div className="space-y-2">
                      {(field.config?.options || []).map((option, index) => (
                        <label key={index} className="flex items-center">
                          <input type="checkbox" disabled className="mr-2" />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {(field.config?.options || []).map((option, index) => (
                        <label key={index} className="flex items-center">
                          <input type="radio" name={field.id} disabled className="mr-2" />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.type === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted: {(field.config?.acceptedTypes || []).join(', ')} 
                        • Max {field.config?.maxSize || 10}MB
                      </p>
                    </div>
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  )}

                  {field.type === 'rating' && (
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: field.config?.stars || 5 }).map((_, index) => (
                        <Star key={index} size={20} className="text-gray-300" />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            disabled
            className="bg-green-600 text-white px-6 py-2 rounded-lg opacity-50 cursor-not-allowed"
          >
            Submit Application
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <TeReoText english="Application Form Builder" teReoKey="form_builder" />
              </h1>
              <p className="text-gray-600">
                Create a custom application form for your job posting
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye size={16} className="mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={saveFormConfig}
                disabled={isSaving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPreviewMode ? (
        // Preview Mode
        <div className="py-8">
          {renderFormPreview()}
        </div>
      ) : (
        // Builder Mode
        <div className="flex">
          {/* Field Types Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Types</h3>
            <div className="space-y-2">
              {fieldTypes.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <button
                    key={fieldType.type}
                    onClick={() => addField(fieldType.type)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <Icon size={16} className="text-gray-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{fieldType.label}</div>
                        <div className="text-xs text-gray-500">{fieldType.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Builder */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Form Header */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <input
                  type="text"
                  value={formConfig.title}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold text-gray-900 border-none focus:outline-none focus:ring-0 p-0 w-full"
                  placeholder="Form Title"
                />
                <textarea
                  value={formConfig.description}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="text-gray-600 border-none focus:outline-none focus:ring-0 p-0 w-full mt-2 resize-none"
                  placeholder="Form description"
                  rows={2}
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {formConfig.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedField?.id === field.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedField(field);
                      setShowFieldSettings(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {renderFieldIcon(field.type)}
                        <span className="ml-3 font-medium text-gray-900">
                          {field.label}
                          {field.config?.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                        {field.type === 'section' && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Section
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(field.id, 'up');
                          }}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(field.id, 'down');
                          }}
                          disabled={index === formConfig.fields.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateField(field.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteField(field.id);
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {field.description && (
                      <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                    )}
                  </div>
                ))}

                {formConfig.fields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No fields added yet</h3>
                    <p className="text-gray-600">Start building your form by adding fields from the sidebar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Field Settings Sidebar */}
          {showFieldSettings && selectedField && renderFieldSettings()}
        </div>
      )}
    </div>
  );
};

export default ApplicationFormBuilder;