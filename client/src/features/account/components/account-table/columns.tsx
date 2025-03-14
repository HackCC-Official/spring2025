import { ColumnDef } from "@tanstack/react-table";
import { AccountDTO } from "../../types/account-dto";
import { RolesBadge } from "../roles-badge";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AccountActions } from "../account-actions";

export const columns: ColumnDef<AccountDTO>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name'
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name'
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <Badge variant='outline' className="">{row.original.email}</Badge>
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => <RolesBadge roles={row.original.roles} />
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => format(row.original.createdAt || '', 'MMM, do yyyy hh:mm aaaa')
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-center w-full">
          <AccountActions
            id={row.original.id}
            email={row.original.email}
          />
        </div>
      );
    }
  }
]