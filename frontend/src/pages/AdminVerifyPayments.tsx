import React, { useState, useEffect } from "react";
import {
    DataGrid,
    GridColDef,
    GridPaginationModel,
    GridValueGetter,
    GridRenderCellParams
} from "@mui/x-data-grid";
import { getAdminBankTransfers, getAdminBankTransferDetails, verifyBankTransfer } from "../api/payment";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

type TransferStatus = 'pending' | 'approved' | 'rejected';

interface UserInfo {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    credit?: number;
}

interface AdminBankTransfer {
    id: number;
    userId: number;
    amount: number;
    type: string;
    status: TransferStatus;
    attachmentUrl: string;
    transferDate: string;
    orderId: string;
    adminNote?: string;
    verifiedBy?: number;
    verifiedAt?: string;
    createdAt: string;
    User: UserInfo;
}

const AdminVerifyPayments: React.FC = () => {
    const [transfers, setTransfers] = useState<AdminBankTransfer[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<TransferStatus>('pending');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<AdminBankTransfer | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'approved' | 'rejected'>('approved');
    const [adminNote, setAdminNote] = useState('');

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const data = await getAdminBankTransfers(selectedStatus);
            // Map the data to ensure each row has a top-level `id` field
            const mappedData = data.map((transfer: any) => ({
                ...transfer,
                id: transfer.id, // Ensure `id` is at the top level
                userData: transfer.User ? `${transfer.User.firstName || ''} ${transfer.User.lastName || ''}` : 'Unknown User',
                user: transfer.User || { firstName: 'Unknown', lastName: 'User', email: '' },
            }));
            setTransfers(mappedData);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load transfers' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, [selectedStatus]);

    const handleViewDetails = async (id: number) => {
        try {
            const details = await getAdminBankTransferDetails(id);
            // Ensure 'User' property exists
            if (!details.User) {
                details.User = { firstName: 'Unknown', lastName: 'User', email: '', id: 0, credit: 0 };
            }
            setSelectedTransfer(details);
            setOpenDialog(true);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load transfer details' });
        }
    };

    const handleVerify = async () => {
        if (!selectedTransfer) return;

        try {
            await verifyBankTransfer(selectedTransfer.id, verificationStatus, adminNote);
            setMessage({
                type: 'success',
                text: `Transfer ${verificationStatus} successfully`
            });
            setOpenDialog(false);
            fetchTransfers();
            setAdminNote('');
        } catch (error) {
            setMessage({
                type: 'error',
                text: `Failed to ${verificationStatus} transfer`
            });
        }
    };

    const columns: GridColDef<AdminBankTransfer>[] = [
        {
            field: 'userData',
            headerName: 'User',
            width: 250,
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
        },
        {
            field: 'createdAt',
            headerName: 'Transfer Date',
            width: 180,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params: GridRenderCellParams<AdminBankTransfer>) => (
                <Box
                    sx={{
                        backgroundColor:
                            params.row.status === 'approved' ? '#e8f5e9' :
                                params.row.status === 'rejected' ? '#ffebee' :
                                    '#fff8e1',
                        color:
                            params.row.status === 'approved' ? '#2e7d32' :
                                params.row.status === 'rejected' ? '#c62828' :
                                    '#f57f17',
                        padding: '6px 16px',
                        borderRadius: '16px',
                        fontSize: '0.875rem',
                    }}
                >
                    {params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)}
                </Box>
            ),
        },
        {
            field: 'proof',
            headerName: 'Proof',
            width: 120,
            renderCell: (params: GridRenderCellParams<AdminBankTransfer>) => (
                <Button
                    variant="outlined"
                    size="small"
                    disabled={!params.row.attachmentUrl}
                    sx={{ textTransform: 'none' }}
                    onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL}/uploads/${params.row.attachmentUrl}`, '_blank')}
                >
                    View Proof
                </Button>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params: GridRenderCellParams<AdminBankTransfer>) => (
                params.row.status === 'pending' && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewDetails(params.row.id)}
                    >
                        Verify
                    </Button>
                )
            ),
        },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <h1>Payment Verification Dashboard</h1>

            {message && (
                <Alert
                    severity={message.type}
                    sx={{ mb: 2 }}
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            <Box sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        value={selectedStatus}
                        label="Filter by Status"
                        onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <DataGrid
                rows={transfers}
                columns={columns}
                loading={loading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                autoHeight
                disableRowSelectionOnClick
                sx={{
                    backgroundColor: 'white',
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },
                }}
            />

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Verify Bank Transfer</DialogTitle>
                <DialogContent>
                    {selectedTransfer && (
                        <Box sx={{ pt: 2 }}>
                            <Box sx={{ mb: 3 }}>
                                <p><strong>User: </strong>
                                    {selectedTransfer.User.firstName} {selectedTransfer.User.lastName}
                                </p>
                                <p><strong>Email: </strong> {selectedTransfer.User.email}</p>
                                <p><strong>Amount: </strong> {selectedTransfer.amount} TND</p>
                                <p><strong>Current Credit: </strong> {selectedTransfer.User.credit} TND</p>
                                <p><strong>Transfer Date: </strong>
                                    {new Date(selectedTransfer.createdAt).toLocaleString()}
                                </p>
                            </Box>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Verification Status</InputLabel>
                                <Select
                                    value={verificationStatus}
                                    label="Verification Status"
                                    onChange={(e) => setVerificationStatus(e.target.value as 'approved' | 'rejected')}
                                >
                                    <MenuItem value="approved">Approve</MenuItem>
                                    <MenuItem value="rejected">Reject</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Admin Note"
                                multiline
                                rows={4}
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Add a note explaining your decision..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleVerify}
                        variant="contained"
                        color={verificationStatus === 'approved' ? 'primary' : 'error'}
                    >
                        {verificationStatus === 'approved' ? 'Approve' : 'Reject'} Transfer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminVerifyPayments;