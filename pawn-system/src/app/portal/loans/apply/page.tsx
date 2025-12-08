
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import WizardForm from "./wizard-form"
import { CheckCircle2 } from "lucide-react"

export default async function QuickApplyPage() {
    const session = await auth()
    const user = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    Quick Capital Application
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Get a preliminary offer for your assets in minutes.
                </p>
            </div>

            {/* Stepper Visualization (Static here, effectively handled inside Wizard but nice to show context) */}
            {/* Actually, let's leave stepper inside WizardForm to keep state sync easy */}

            <WizardForm user={user} />
        </div>
    )
}
