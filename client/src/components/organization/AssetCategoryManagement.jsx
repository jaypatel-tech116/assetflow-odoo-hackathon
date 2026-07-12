import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/organizationService';

export default function AssetCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    custom_fields: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      if (res.success) setCategories(res.categories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...formData.custom_fields];
    newFields[index][field] = value;
    setFormData(prev => ({ ...prev, custom_fields: newFields }));
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      custom_fields: [...prev.custom_fields, { field_name: '', field_type: 'Text' }]
    }));
  };

  const removeField = (index) => {
    const newFields = [...formData.custom_fields];
    newFields.splice(index, 1);
    setFormData(prev => ({ ...prev, custom_fields: newFields }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty fields
      const validFields = formData.custom_fields.filter(f => f.field_name.trim() !== '');
      
      const dataToSubmit = {
        name: formData.name,
        description: formData.description,
        custom_fields: validFields,
      };

      if (formData.id) {
        await updateCategory(formData.id, dataToSubmit);
      } else {
        await createCategory(dataToSubmit);
      }
      
      handleReset();
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to save category', error);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      custom_fields: category.custom_fields || [],
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated fields will be removed.')) return;
    try {
      await deleteCategory(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete category', error);
    }
  };

  const handleReset = () => {
    setFormData({
      id: null,
      name: '',
      description: '',
      custom_fields: []
    });
  };

  return (
    <div className="org-split-layout">
      {/* Left side: Table */}
      <div className="org-card">
        <div className="org-card-header">
          <h2 className="org-card-title">Asset Category Management</h2>
          <button className="org-btn-primary" onClick={handleReset}>+ Add Category</button>
        </div>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Custom Fields</th>
                <th>Asset Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center'}}>No categories found.</td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{fontWeight: 500}}>{cat.name}</td>
                    <td>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                        {cat.custom_fields && cat.custom_fields.length > 0 ? (
                          cat.custom_fields.map(cf => (
                            <span key={cf.id} style={{fontSize: '11px', background: '#ede9fe', color: '#6d28d9', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd6fe'}}>
                              {cf.field_name} ({cf.field_type})
                            </span>
                          ))
                        ) : (
                          <span style={{color: '#9ca3af', fontSize: '12px'}}>-</span>
                        )}
                      </div>
                    </td>
                    <td>{cat.asset_count}</td>
                    <td>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => handleEdit(cat)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280'}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(cat.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444'}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        
        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#6b7280'}}>
          <span>Showing 1 to {categories.length} of {categories.length} entries</span>
          <div style={{display: 'flex', gap: '4px'}}>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&lt;</button>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #4f46e5', background: '#4f46e5', color: '#fff', cursor: 'pointer'}}>1</button>
            <button style={{width: 32, height: 32, borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer'}}>&gt;</button>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="org-card">
        <h3 className="org-card-title" style={{marginBottom: '20px'}}>
          {formData.id ? 'Edit Asset Category' : 'Add / Edit Asset Category'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="org-form-group">
            <label className="org-form-label">Category Name <span className="required">*</span></label>
            <input 
              type="text" 
              name="name" 
              className="org-form-input" 
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Description</label>
            <textarea 
              name="description" 
              className="org-form-input" 
              placeholder="Enter description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              style={{resize: 'vertical'}}
            ></textarea>
          </div>

          <div style={{marginTop: '24px', marginBottom: '16px'}}>
            <h4 style={{fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0'}}>Custom Fields</h4>
            
            {formData.custom_fields.length > 0 && (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: '8px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280'}}>
                <div>Field Name</div>
                <div>Field Type</div>
                <div>Actions</div>
              </div>
            )}

            {formData.custom_fields.map((field, index) => (
              <div key={index} style={{display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: '8px', marginBottom: '12px', alignItems: 'center'}}>
                <input 
                  type="text" 
                  className="org-form-input" 
                  placeholder="Field Name"
                  value={field.field_name}
                  onChange={(e) => handleFieldChange(index, 'field_name', e.target.value)}
                  required
                />
                <select 
                  className="org-form-select"
                  value={field.field_type}
                  onChange={(e) => handleFieldChange(index, 'field_type', e.target.value)}
                >
                  <option value="Text">Text</option>
                  <option value="Number">Number</option>
                  <option value="Date">Date</option>
                  <option value="Boolean">Boolean</option>
                  <option value="Select">Select</option>
                </select>
                <button type="button" onClick={() => removeField(index)} style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', width: '32px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))}

            <button type="button" onClick={addField} style={{background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', marginTop: '4px'}}>
              + Add Field
            </button>
          </div>

          <div className="org-form-actions">
            <button type="button" className="org-btn-outline" onClick={handleReset}>Reset</button>
            <button type="submit" className="org-btn-primary">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  );
}
