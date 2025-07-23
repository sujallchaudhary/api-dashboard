import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Phone } from 'lucide-react';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phoneNo?: string;
  subject: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
}

interface MessagesManagementProps {
  messages: ContactMessage[];
}

export function MessagesManagement({ messages }: MessagesManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Contact messages from your portfolio website
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {messages.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Messages
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {messages.filter(m => !m.isRead).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unread Messages
                </p>
              </div>
              <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {messages.filter(m => m.phoneNo).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  With Phone Number
                </p>
              </div>
              <Phone className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
          <CardDescription>
            Contact messages received through your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No messages</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You haven't received any contact messages yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message._id}>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>
                      <a 
                        href={`mailto:${message.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {message.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      {message.phoneNo ? (
                        <a 
                          href={`tel:${message.phoneNo}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {message.phoneNo}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {message.subject}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {message.message}
                    </TableCell>
                    <TableCell>
                      <Badge variant={message.isRead ? "secondary" : "default"}>
                        {message.isRead ? "Read" : "New"}
                      </Badge>
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
