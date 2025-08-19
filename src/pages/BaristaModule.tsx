import PasswordProtection from '@/components/PasswordProtection'
import { appConfig } from '@/config/app.config'

function BaristaModulePage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-coffee-800 mb-6">
          Barista Administration Dashboard
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-coffee-700 mb-2">
              Order Management
            </h3>
            <p className="text-coffee-600 text-sm">
              View and manage incoming orders, update order status, and handle queue.
            </p>
            <div className="mt-4 text-orange-600 font-medium">
              Coming Soon
            </div>
          </div>
          
          <div className="text-center py-8">
            <div className="text-4xl mb-4">☕</div>
            <h3 className="text-lg font-semibold text-coffee-700 mb-2">
              Menu Management
            </h3>
            <p className="text-coffee-600 text-sm">
              Add, edit, and remove drinks from the menu. Configure drink options.
            </p>
            <div className="mt-4 text-orange-600 font-medium">
              Coming Soon
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-coffee-50 rounded-lg">
          <h4 className="font-semibold text-coffee-800 mb-2">
            Features in Development:
          </h4>
          <ul className="text-sm text-coffee-600 space-y-1">
            <li>• Real-time order notifications</li>
            <li>• Bulk order operations</li>
            <li>• Menu customization</li>
            <li>• Order analytics</li>
            <li>• Export capabilities</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ProtectedBaristaModule() {
  return (
    <PasswordProtection
      requiredPassword={appConfig.adminPassword}
      title="Barista Administration"
      description="Enter the admin password to access the barista dashboard"
      role="admin"
    >
      <BaristaModulePage />
    </PasswordProtection>
  )
}

export default ProtectedBaristaModule