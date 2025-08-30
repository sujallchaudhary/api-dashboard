import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, ExternalLink, Github } from 'lucide-react';
import { createPreviewUrl, revokePreviewUrl } from '@/lib/upload';

interface Project {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  demoLink: string;
  sourceCodeLink: string;
}

interface ProjectsManagementProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, '_id'> | FormData) => Promise<void>;
  onUpdateProject: (id: string, project: Omit<Project, '_id'> | FormData) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export function ProjectsManagement({ projects, onAddProject, onUpdateProject, onDeleteProject }: ProjectsManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    demoLink: '',
    sourceCodeLink: ''
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      demoLink: '',
      sourceCodeLink: ''
    });
    setEditingProject(null);
    setError('');
    setThumbnailFile(null);
    // Clean up preview URL if it's a blob URL
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      revokePreviewUrl(thumbnailPreview);
    }
    setThumbnailPreview('');
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.name,
        description: project.description,
        image: project.thumbnail,
        demoLink: project.demoLink,
        sourceCodeLink: project.sourceCodeLink
      });
      setThumbnailPreview(project.thumbnail);
      setThumbnailFile(null);
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
      setThumbnailFile(file);
      // Clean up previous preview URL if it exists
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        revokePreviewUrl(thumbnailPreview);
      }
      // Create new preview URL using createObjectURL (more efficient than FileReader)
      const previewUrl = createPreviewUrl(file);
      setThumbnailPreview(previewUrl);
      // Clear the URL field when file is selected
      setFormData({ ...formData, image: '' });
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, image: url });
    // Clean up previous preview URL if it's a blob URL
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      revokePreviewUrl(thumbnailPreview);
    }
    setThumbnailPreview(url);
    setThumbnailFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create FormData and include all fields
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('demoLink', formData.demoLink);
      formDataToSend.append('sourceCodeLink', formData.sourceCodeLink);
      
      // If a file is selected, append it as binary data
      if (thumbnailFile) {
        formDataToSend.append('image', thumbnailFile);
      } else if (formData.image) {
        // If URL is provided instead of file
        formDataToSend.append('image', formData.image);
      }

      if (editingProject) {
        await onUpdateProject(editingProject._id, formDataToSend);
      } else {
        await onAddProject(formDataToSend);
      }
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setLoading(true);
    try {
      await onDeleteProject(id);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your portfolio projects
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className='text-white' onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] text-white">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </DialogTitle>
              <DialogDescription>
                {editingProject ? 'Update the project details below.' : 'Fill in the details to create a new project.'}
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
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter project description"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail</Label>
                  <div className="space-y-3">
                    {/* File Upload Option */}
                    <div>
                      <Label htmlFor="thumbnailFile" className="text-sm text-gray-600 dark:text-gray-400">
                        Upload Image File
                      </Label>
                      <Input
                        id="thumbnailFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-1"
                      />
                    </div>
                    
                    {/* URL Option */}
                    <div>
                      <Label htmlFor="thumbnailUrl" className="text-sm text-gray-600 dark:text-gray-400">
                        Or Enter Image URL
                      </Label>
                      <Input
                        id="thumbnailUrl"
                        value={formData.image}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                    
                    {/* Preview */}
                    {thumbnailPreview && (
                      <div className="mt-2">
                        <Label className="text-sm text-gray-600 dark:text-gray-400">Preview</Label>
                        <div className="mt-1 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="max-h-32 max-w-full object-contain rounded"
                            onError={() => setThumbnailPreview('')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="demoLink">Demo Link</Label>
                  <Input
                    id="demoLink"
                    value={formData.demoLink}
                    onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                    placeholder="Enter demo/live URL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sourceCodeLink">Source Code Link</Label>
                  <Input
                    id="sourceCodeLink"
                    value={formData.sourceCodeLink}
                    onChange={(e) => setFormData({ ...formData, sourceCodeLink: e.target.value })}
                    placeholder="Enter GitHub or source code URL"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button className='text-white' type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingProject ? 'Update' : 'Create')} Project
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
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No projects found. Add your first project!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {project.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {project.demoLink && (
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {project.sourceCodeLink && (
                          <a
                            href={project.sourceCodeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(project._id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
