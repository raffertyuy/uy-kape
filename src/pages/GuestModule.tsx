import PasswordProtection from '@/components/PasswordProtection'
import { appConfig } from '@/config/app.config'

function GuestModulePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-coffee-800 mb-6">
          Order Your Coffee ☕
        </h2>
        
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
      role="guest"
    >
      <GuestModulePage />
    </PasswordProtection>
  )
}

export default ProtectedGuestModule