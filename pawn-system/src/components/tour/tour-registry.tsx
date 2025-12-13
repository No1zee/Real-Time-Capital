import { Step } from "react-joyride"
import { Sparkles, Bot } from "lucide-react"

export interface AppTourStep extends Step {
    id?: string

    route?: string | string[]
    roles?: string[] // Optional: If defined, only show for these roles. If undefined, show for all.
}

// Helper for consistent "Persona" UI
const TourHeader = ({ title, icon: Icon = Sparkles }: { title: string, icon?: any }) => (
    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
        <div className="bg-primary/10 p-2 rounded-xl ring-1 ring-primary/20">
            <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</span>
    </div>
)

export const tourSteps: AppTourStep[] = [
    // --- Global / Layout Items ---
    // --- Guest Welcome (Auctions) ---
    {
        id: 'intro-guest',
        target: 'body',
        content: (
            <div>
                <TourHeader title="Welcome" icon={Bot} />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Welcome to Cashpoint</h3>
                <p className="text-muted-foreground mb-2 leading-relaxed">You are currently viewing the <strong>Live Auctions</strong> page.</p>
                <p className="text-muted-foreground text-sm leading-relaxed">This view allows you to browse active listings. To place bids, manage loans, or access your dashboard, you will need to <strong className="text-primary font-semibold">Log In</strong>.</p>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
        route: ['/portal/auctions'],
        roles: ['GUEST']
    },

    // --- Logged In Welcome ---
    {
        id: 'intro-user',
        target: 'body',
        content: (
            <div>
                <TourHeader title="Demo Mode" icon={Bot} />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">System Capability Demo</h3>
                <p className="text-muted-foreground mb-2 leading-relaxed">Welcome to the user portal demo. We are excited to show you the core features.</p>
                <p className="text-muted-foreground text-sm leading-relaxed">While it is far from a finished product, this demo will highlight what the system is capable of so far.</p>
            </div>
        ),
        placement: 'center',
        disableBeacon: true,
        route: ['/portal', '/admin/dashboard'],
        // roles: undefined // Implicitly for all? No, let's restrict to avoid double welcome
        roles: ['ADMIN', 'STAFF', 'CUSTOMER']
    },

    // --- Customer Dashboard ---
    {
        target: 'body',
        content: (
            <div>
                <TourHeader title="Dashboard" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Your Command Center</h3>
                <p className="text-muted-foreground leading-relaxed">Track your active loans, total debt, and pawned items at a glance. We calculate your liquidity so you don't have to.</p>
            </div>
        ),
        route: '/portal'
    },

    // --- Auctions Page ---
    {
        target: '#auctions-title',
        content: (
            <div>
                <TourHeader title="Auctions" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">The Recovery Engine</h3>
                <p className="text-muted-foreground leading-relaxed">Think of this as your safety net. If a loan defaults, the item automatically flips to "For Sale" right here. It's the hassle-free way to recover your cash instantly.</p>
            </div>
        ),
        route: '/portal/auctions',
        roles: ['ADMIN', 'STAFF']
    },

    // --- Loans Page ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Loans" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Smart Lending</h3>
                <p className="text-muted-foreground leading-relaxed">Borrowing made compliant. I calculate the interest, track the due dates, and flag high-risk customers for you.</p>
            </div>
        ),
        route: ['/portal/loans', '/loans'],
        roles: ['ADMIN', 'STAFF']
    },

    // --- Inventory / Items ---
    {
        target: '#admin-inventory-title, #user-inventory-title',
        content: (
            <div>
                <TourHeader title="Inventory" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Your Digital Vault</h3>
                <p className="text-muted-foreground leading-relaxed">Every item is tracked here—from "Pawned" to "Sold". No more successful thefts or missing ledgers.</p>
            </div>
        ),
        placement: 'center',
        route: ['/inventory', '/admin/inventory', '/portal/items'],
        roles: ['ADMIN', 'STAFF']
    },

    // --- Profile / Wallet ---
    {
        target: '[href="/portal/wallet"]',
        content: (
            <div>
                <TourHeader title="Wallet" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Instant Cash Flow</h3>
                <p className="text-muted-foreground leading-relaxed">See your liquidity in real-time. Payouts and collections are synced automatically so your books never lag.</p>
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
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">The Command Center</h3>
                <p className="text-muted-foreground leading-relaxed">Everything at a glance. I track your organization's health, staff activity, and daily profit so you don't have to.</p>
            </div>
        ),
        route: '/admin/dashboard',
        roles: ['ADMIN', 'STAFF']
    },

    // --- Users / CRM ---
    {
        target: '#admin-users-title',
        content: (
            <div>
                <TourHeader title="CRM" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Know Your Customer</h3>
                <p className="text-muted-foreground leading-relaxed">I build a "Trust Score" for everyone. See who pays on time and who's a flight risk before you lend.</p>
            </div>
        ),
        route: '/admin/users',
        roles: ['ADMIN', 'STAFF']
    },

    // --- Reports ---
    {
        target: 'main',
        content: (
            <div>
                <TourHeader title="Reports" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Data-Driven Decisions</h3>
                <p className="text-muted-foreground leading-relaxed">Stop guessing. I generate audit-ready reports on your exact extensive profit margins and capital exposure.</p>
            </div>
        ),
        placement: 'center',
        route: '/admin/reports',
        roles: ['ADMIN', 'STAFF']
    },

    // --- Valuations ---
    {
        target: '#admin-valuations-title',
        content: (
            <div>
                <TourHeader title="Valuations" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">AI Appraisals</h3>
                <p className="text-muted-foreground leading-relaxed">Don't over-lend. I help verify item value so you never get stuck with bad collateral.</p>
            </div>
        ),
        route: '/admin/valuations',
        roles: ['ADMIN', 'STAFF']
    },

    // --- Content / Education Hub ---
    {
        target: '#education-title',
        content: (
            <div>
                <TourHeader title="Knowledge" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">The User Education Engine</h3>
                <p className="text-muted-foreground mb-2 leading-relaxed">This is more than just articles. It's a strategic tool.</p>
                <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p><strong>For Users:</strong> It provides critical financial literacy and guides on how to maximize their asset's value.</p>
                    <p><strong>For Business:</strong> It builds trust and filters for higher-quality applications by educating customers <em>before</em> they apply.</p>
                </div>
            </div>
        ),
        route: '/portal/education'
    },

    // --- Content / Education Hub (Admin) ---
    {
        target: '#admin-content-title',
        content: (
            <div>
                <TourHeader title="Content" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Education Hub</h3>
                <p className="text-muted-foreground leading-relaxed">Educate your customers. Create articles about art valuation, pawning tips, and financial literacy here.</p>
            </div>
        ),
        route: '/admin/education'
    },

    // --- Admin Auctions ---
    {
        target: '#admin-auctions-title',
        content: (
            <div>
                <TourHeader title="Auctions" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Live Control</h3>
                <p className="text-muted-foreground leading-relaxed">Monitor all bidding in real-time. You can force-end auctions or cancel them if issues arise.</p>
            </div>
        ),
        route: '/admin/auctions',
        roles: ['ADMIN', 'STAFF']
    },

    // --- Admin Payments ---
    {
        target: 'h1',
        content: (
            <div>
                <TourHeader title="Payments" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Cash Flow</h3>
                <p className="text-muted-foreground leading-relaxed">Track every penny. View incoming loan repayments and outgoing payouts in one secure ledger.</p>
            </div>
        ),
        route: '/admin/payments',
        roles: ['ADMIN', 'STAFF']
    },

    // --- Admin Audit Log ---
    {
        target: '#audit-title',
        content: (
            <div>
                <TourHeader title="Audit Log" />
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">Total Oversight</h3>
                <p className="text-muted-foreground leading-relaxed">Security first. I log every single action taken by staff or customers for full accountability.</p>
            </div>
        ),
        route: '/admin/audit',
        roles: ['ADMIN', 'STAFF']
    }
]
