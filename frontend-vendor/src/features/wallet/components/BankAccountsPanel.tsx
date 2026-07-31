import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { useBankAccounts, useCreateBankAccount, useDeleteBankAccount } from '../hooks/useWallet'
import { extractErrorMessage } from '../../../shared/lib/api-client'

function maskAccountNumber(value: string) {
  if (value.length <= 4) return value
  return `••••${value.slice(-4)}`
}

export function BankAccountsPanel() {
  const { data: accounts, isLoading } = useBankAccounts()
  const createMutation = useCreateBankAccount()
  const deleteMutation = useDeleteBankAccount()

  const [showForm, setShowForm] = useState(false)
  const [holderName, setHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [ibanOrRouting, setIbanOrRouting] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    setError(null)
    if (!holderName.trim() || !accountNumber.trim() || !bankName.trim()) {
      setError('Account holder name, account number, and bank name are required.')
      return
    }
    try {
      await createMutation.mutateAsync({
        account_holder_name: holderName.trim(),
        account_number: accountNumber.trim(),
        bank_name: bankName.trim(),
        iban_or_routing: ibanOrRouting || undefined,
      })
      setHolderName('')
      setAccountNumber('')
      setBankName('')
      setIbanOrRouting('')
      setShowForm(false)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      {!isLoading && !accounts?.length && !showForm && (
        <Typography variant="body2" color="text.secondary">
          No bank accounts yet.
        </Typography>
      )}

      {accounts?.map((account) => (
        <Paper key={account.id} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{account.bank_name}</Typography>
                {account.is_default && <Chip size="small" label="Default" color="primary" />}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {account.account_holder_name} · {maskAccountNumber(account.account_number)}
              </Typography>
            </Stack>
            <Button size="small" color="error" onClick={() => handleDelete(account.id)} disabled={deleteMutation.isPending}>
              Remove
            </Button>
          </Stack>
        </Paper>
      ))}

      {showForm ? (
        <Stack spacing={1.5} sx={{ maxWidth: 420 }}>
          <Divider />
          <Typography variant="subtitle2">Add a bank account</Typography>
          <TextField
            label="Account holder name"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            fullWidth
          />
          <TextField label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} fullWidth />
          <TextField
            label="IBAN / routing number (optional)"
            value={ibanOrRouting}
            onChange={(e) => setIbanOrRouting(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleAdd} disabled={createMutation.isPending}>
              Save
            </Button>
            <Button onClick={() => setShowForm(false)}>Cancel</Button>
          </Stack>
        </Stack>
      ) : (
        <Button variant="outlined" onClick={() => setShowForm(true)} sx={{ alignSelf: 'flex-start' }}>
          Add bank account
        </Button>
      )}
    </Stack>
  )
}
