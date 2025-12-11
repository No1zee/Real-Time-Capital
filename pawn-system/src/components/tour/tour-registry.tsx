import { Step } from "react-joyride"
import { Sparkles, Bot } from "lucide-react"

export interface AppTourStep extends Step {
    route?: string | string[]
}

// Helper for consistent "Persona" UI
const TourHeader = ({ title, icon: Icon = Sparkles }: { title: string, icon?: any }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-cyan-100">
        <div className="bg-cyan-100 p-1.5 rounded-full">
            <Icon className="w-4 h-4 text-cyan-600" />
        </div>
        <span className="text-sm font-bold text-cyan-900 uppercase tracking-wider">MVP Core Assistant</span>
    </div>
)

export const tourSteps: AppTourStep[] = [
    // --- Global / Layout Items ---
    {
        target: 'body',
        content: (
            <div>
                <TourHeader title="Welcome" icon={Bot} />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Digital Core Active</h3>
                <p className="text-slate-600">I am your MVP assistant. I'm running in the background to monitor your operations.</p>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
        route: ['/portal', '/portal/auctions', '/admin/dashboard']
    },

    // --- Auctions Page ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Auctions" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">The Recovery Engine</h3>
                <p className="text-slate-600">Think of this as your safety net. If a loan defaults, the item automatically flips to "For Sale" right here. It's the hassle-free way to recover your cash instantly.</p>
            </div>
        ),
        route: '/portal/auctions'
    },

    // --- Loans Page ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Loans" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Smart Lending</h3>
                <p className="text-slate-600">Borrowing made compliant. I calculate the interest, track the due dates, and flag high-risk customers for you.</p>
            </div>
        ),
        route: ['/portal/loans', '/loans']
    },

    // --- Inventory / Items ---
    {
        target: 'main',
        content: (
            <div>
                <TourHeader title="Inventory" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Your Digital Vault</h3>
                <p className="text-slate-600">Every item is tracked here—from "Pawned" to "Sold". No more successful thefts or missing ledgers.</p>
            </div>
        ),
        placement: 'center',
        route: ['/inventory', '/admin/inventory', '/portal/items']
    },

    // --- Profile / Wallet ---
    {
        target: '[href="/portal/wallet"]',
        content: (
            <div>
                <TourHeader title="Wallet" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Instant Cash Flow</h3>
                <p className="text-slate-600">See your liquidity in real-time. Payouts and collections are synced automatically so your books never lag.</p>
            </div>
        ),
        route: '/portal/wallet'
    },

    // --- Admin Dashboard ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Dashboard" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">The Command Center</h3>
                <p className="text-slate-600">Everything at a glance. I track your organization's health, staff activity, and daily profit so you don't have to.</p>
            </div>
        ),
        route: '/admin/dashboard'
    },

    // --- Users / CRM ---
    {
        target: 'table',
        content: (
            <div>
                <TourHeader title="CRM" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Know Your Customer</h3>
                <p className="text-slate-600">I build a "Trust Score" for everyone. See who pays on time and who's a flight risk before you lend.</p>
            </div>
        ),
        route: '/admin/users'
    },

    // --- Reports ---
    {
        target: 'main',
        content: (
            <div>
                <TourHeader title="Reports" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Data-Driven Decisions</h3>
                <p className="text-slate-600">Stop guessing. I generate audit-ready reports on your exact extensive profit margins and capital exposure.</p>
            </div>
        ),
        placement: 'center',
        route: '/admin/reports'
    },

    // --- Valuations ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Valuations" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">AI Appraisals</h3>
                <p className="text-slate-600">Don't over-lend. I help verify item value so you never get stuck with bad collateral.</p>
            </div>
        ),
        route: '/admin/valuations'
    },

    // --- Content / Education Hub ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Knowledge" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">The Knowledge Hub</h3>
                <p className="text-slate-600">Empower yourself. Read guides on how to get the best value for your items and manage your loans responsibly.</p>
            </div>
        ),
        route: '/portal/education'
    },

    // --- Content / Education Hub (Admin) ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Content" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Education Hub</h3>
                <p className="text-slate-600">Educate your customers. Create articles about art valuation, pawning tips, and financial literacy here.</p>
            </div>
        ),
        route: '/admin/education'
    },

    // --- Admin Auctions ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Auctions" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Live Control</h3>
                <p className="text-slate-600">Monitor all bidding in real-time. You can force-end auctions or cancel them if issues arise.</p>
            </div>
        ),
        route: '/admin/auctions'
    },

    // --- Admin Payments ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Payments" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Cash Flow</h3>
                <p className="text-slate-600">Track every penny. View incoming loan repayments and outgoing payouts in one secure ledger.</p>
            </div>
        ),
        route: '/admin/payments'
    },

    // --- Admin Audit Log ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Audit Log" />
                <h3 className="font-bold text-lg mb-2 text-slate-800">Total Oversight</h3>
                <p className="text-slate-600">Security first. I log every single action taken by staff or customers for full accountability.</p>
            </div>
        ),
        route: '/admin/transactions'
    }
]
