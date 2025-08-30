import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, ExternalLink, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

interface ShortenedUrl {
  _id: string;
  shortenUrl: string;
  fullUrl: string;
  clicks: number;
  userId?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UrlManagementProps {
  urls: ShortenedUrl[];
  pagination: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onAddUrl: (url: { fullUrl: string }) => Promise<void>;
  onUpdateUrl: (id: string, url: { fullUrl: string; shortenUrl: string }) => Promise<void>;
  onDeleteUrl: (id: string) => Promise<void>;
}

export function UrlManagement({ urls, pagination, currentPage, onPageChange, onAddUrl, onUpdateUrl, onDeleteUrl }: UrlManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  
  const [formData, setFormData] = useState({
    fullUrl: '',
    shortenUrl: ''
  });

  // Helper function to format date/time
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const resetForm = () => {
    setFormData({
      fullUrl: '',
      shortenUrl: ''
    });
    setEditingUrl(null);
    setError('');
  };

  const handleOpenDialog = (url?: ShortenedUrl) => {
    if (url) {
      setEditingUrl(url);
      setFormData({
        fullUrl: url.fullUrl,
        shortenUrl: url.shortenUrl
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullUrl) {
      setError('Please enter a URL to shorten');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.fullUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingUrl) {
        await onUpdateUrl(editingUrl._id, formData);
      } else {
        await onAddUrl({ fullUrl: formData.fullUrl });
      }
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) {
      return;
    }

    setLoading(true);
    try {
      await onDeleteUrl(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const activeUrls = urls.filter(url => url.isDeleted !== true);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">URL Shortener</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your shortened URLs and track their performance
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className='text-white' onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4 text-white" />
              Shorten URL
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] text-white">
            <DialogHeader>
              <DialogTitle>
                {editingUrl ? 'Edit URL' : 'Shorten New URL'}
              </DialogTitle>
              <DialogDescription>
                {editingUrl ? 'Update the URL details below.' : 'Enter a URL to create a shortened version.'}
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
                  <Label htmlFor="fullUrl">Full URL *</Label>
                  <Input
                    id="fullUrl"
                    value={formData.fullUrl}
                    onChange={(e) => setFormData({ ...formData, fullUrl: e.target.value })}
                    placeholder="https://example.com/very/long/url"
                    required
                  />
                </div>
                
                {editingUrl && (
                  <div className="space-y-2">
                    <Label htmlFor="shortenUrl">Short Code</Label>
                    <Input
                      id="shortenUrl"
                      value={formData.shortenUrl}
                      onChange={(e) => setFormData({ ...formData, shortenUrl: e.target.value })}
                      placeholder="Custom short code"
                    />
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button className='text-white' type="submit" disabled={loading}>
                  {loading ? 'Processing...' : (editingUrl ? 'Update' : 'Shorten')} URL
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUrls.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active URLs
                </p>
              </div>
              <ExternalLink className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalClicks.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Clicks
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeUrls.length > 0 ? Math.round(totalClicks / activeUrls.length) : 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Clicks/URL
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {copySuccess && (
        <Alert>
          <AlertDescription>{copySuccess}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All URLs</CardTitle>
          <CardDescription>
            {urls.length} URL{urls.length !== 1 ? 's' : ''} created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {urls.length === 0 ? (
            <div className="text-center py-8">
              <ExternalLink className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No URLs</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create your first shortened URL.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {url.shortenUrl}
                        </code>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => copyToClipboard(`https://sujal.info/${url.shortenUrl}`)}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      <a
                        href={url.fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {url.fullUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                        <span>{url.clicks.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(url.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={url.isDeleted === true ? "secondary" : "default"}>
                        {url.isDeleted === true ? "Deleted" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(url)}
                          disabled={url.isDeleted === true}
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(url._id)}
                          disabled={loading || url.isDeleted === true}
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalItems} total items)
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, Math.min(
                      pagination.totalPages - 4,
                      Math.max(1, pagination.currentPage - 2)
                    )) + i;
                    
                    if (pageNumber > pagination.totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNumber)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!pagination.hasNext || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
