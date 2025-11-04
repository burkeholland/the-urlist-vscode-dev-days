export const metadata = {
  title: 'Account Confirmed'
}

export default function ConfirmedPage() {
  return (
    <div className="mx-auto max-w-md py-16 px-4">
      <h1 className="text-2xl font-semibold mb-4">Account Confirmed</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your email has been confirmed. You can now sign in to start creating beautiful link lists.
      </p>
      <a
        href="/"
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Return Home & Sign In
      </a>
    </div>
  )
}
