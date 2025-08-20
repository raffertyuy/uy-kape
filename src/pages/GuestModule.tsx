import PasswordProtection from '@/components/PasswordProtection'
import { appConfig } from '@/config/app.config'
import { Logo } from '@/components/ui/Logo'

function GuestModulePage() {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 space-y-2 sm:space-y-0 sm:space-x-3">
          <Logo size="md" className="flex-shrink-0" alt="Uy, Kape!" />
          <h2 className="text-xl sm:text-2xl font-bold text-coffee-800 text-center sm:text-left">
            Order Your Coffee
          </h2>
        </div>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-coffee-700 mb-2">
            Coming Soon!
          </h3>
          <p className="text-coffee-600">
            The guest ordering module is currently under development.
            You'll be able to browse the menu and place orders here soon.
          </p>
        </div>
      </div>
    </div>
  )
}

function ProtectedGuestModule() {
  return (
    <PasswordProtection
      requiredPassword={appConfig.guestPassword}
      title="Guest Access"
      description="Enter the guest password to place your coffee order"
      role="guest" // eslint-disable-line jsx-a11y/aria-role
    >
      <GuestModulePage />
    </PasswordProtection>
  )
}

export default ProtectedGuestModule