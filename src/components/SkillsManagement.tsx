import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { createPreviewUrl, revokePreviewUrl } from '@/lib/upload';

interface Skill {
  _id: string;
  name: string;
  image: string;
}

interface SkillsManagementProps {
  skills: Skill[];
  onAddSkill: (skill: Omit<Skill, '_id'> | FormData) => Promise<void>;
  onUpdateSkill: (id: string, skill: Omit<Skill, '_id'> | FormData) => Promise<void>;
  onDeleteSkill: (id: string) => Promise<void>;
}

export function SkillsManagement({ skills, onAddSkill, onUpdateSkill, onDeleteSkill }: SkillsManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const resetForm = () => {
    setFormData({
      name: '',
      image: ''
    });
    setEditingSkill(null);
    setError('');
    setImageFile(null);
    // Clean up preview URL if it's a blob URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      revokePreviewUrl(imagePreview);
    }
    setImagePreview('');
  };

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        image: skill.image
      });
      setImagePreview(skill.image);
      setImageFile(null);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Clean up previous preview URL if it exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        revokePreviewUrl(imagePreview);
      }
      // Create new preview URL using createObjectURL (more efficient than FileReader)
      const previewUrl = createPreviewUrl(file);
      setImagePreview(previewUrl);
      // Clear the URL field when file is selected
      setFormData({ ...formData, image: '' });
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
    // Clean up previous preview URL if it's a blob URL
    if (imagePreview && imagePreview.startsWith('blob:')) {
      revokePreviewUrl(imagePreview);
    }
    setImagePreview(url);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Please enter a skill name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create FormData and include all fields
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      // If a file is selected, append it as binary data
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image) {
        // If URL is provided instead of file
        formDataToSend.append('imageUrl', formData.image);
      }

      if (editingSkill) {
        await onUpdateSkill(editingSkill._id, formDataToSend);
      } else {
        await onAddSkill(formDataToSend);
      }
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    setLoading(true);
    try {
      await onDeleteSkill(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skills</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your technical skills
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className='text-white' onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] text-white">
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </DialogTitle>
              <DialogDescription>
                {editingSkill ? 'Update the skill details below.' : 'Fill in the details to create a new skill.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Skill Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., React, Node.js, Python"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Icon/Image</Label>
                  <div className="space-y-3">
                    {/* File Upload Option */}
                    <div>
                      <Label htmlFor="imageFile" className="text-sm text-gray-600 dark:text-gray-400">
                        Upload Image File
                      </Label>
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1"
                      />
                    </div>
                    
                    {/* URL Option */}
                    <div>
                      <Label htmlFor="imageUrl" className="text-sm text-gray-600 dark:text-gray-400">
                        Or Enter Image URL
                      </Label>
                      <Input
                        id="imageUrl"
                        value={formData.image}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://example.com/icon.png"
                        className="mt-1"
                      />
                    </div>
                    
                    {/* Preview */}
                    {imagePreview && (
                      <div className="mt-2">
                        <Label className="text-sm text-gray-600 dark:text-gray-400">Preview</Label>
                        <div className="mt-1 border rounded-md p-2 bg-gray-50 dark:bg-gray-800 flex justify-center">
                          <img
                            src={imagePreview}
                            alt="Icon preview"
                            className="h-16 w-16 object-contain rounded"
                            onError={() => setImagePreview('')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button className='text-white' type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingSkill ? 'Update' : 'Add')} Skill
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Skills</CardTitle>
          <CardDescription>
            {skills.length} skill{skills.length !== 1 ? 's' : ''} in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No skills found. Add your first skill!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {skills.map((skill) => (
                <Card key={skill._id} className="relative group">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      {skill.image && (
                        <img
                          src={skill.image}
                          alt={skill.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {skill.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(skill)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(skill._id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
