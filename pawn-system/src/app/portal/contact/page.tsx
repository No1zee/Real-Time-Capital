
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Contact Us</h2>
                <p className="text-slate-500 dark:text-slate-400">Get in touch with our team.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <Mail className="w-5 h-5 text-amber-500" />
                            <span>support@pawnportal.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <Phone className="w-5 h-5 text-amber-500" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-5 h-5 text-amber-500" />
                            <span>123 Commerce St, Business City, BC 12345</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Business Hours</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                            <span>Monday - Friday</span>
                            <span>9:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Saturday</span>
                            <span>10:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Sunday</span>
                            <span>Closed</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
