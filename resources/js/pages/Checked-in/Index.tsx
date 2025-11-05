import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from "@/components/ui/button";
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Index({ users }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div>
      </div>
      <div
        className="m-4 bg-white border border-gray-200 
        dark:bg-primary-foreground p-4 rounded-lg"
      >
        <Table className="w-full">
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(({id,name,email})=>
            <TableRow>
              <TableCell className="font-medium">{id}</TableCell>
              <TableCell>{name}</TableCell>
              <TableCell>{email}</TableCell>
              <TableCell><Button variant='default' className='bg-blue-700'>Edit</Button>
              <Button variant='destructive' className='ml-2'>Delete</Button></TableCell> 
            </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}

