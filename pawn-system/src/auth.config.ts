
import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
    callbacks: {
        authorized({ auth, request: nextUrl }) {
            const isLoggedIn = !!auth?.user
            // @ts-ignore
            const userRole = auth?.user?.role as string | undefined

            const pathname = nextUrl.nextUrl.pathname

            // 1. Root Redirect
            if (pathname === "/") {
                return NextResponse.redirect(new URL("/portal/auctions", nextUrl.nextUrl))
            }

            // 2. Define Protected Route Patterns
            const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register")
            const isAdminRoute = pathname.startsWith("/admin")
            const isDashboardRoute = pathname.startsWith("/loans") || pathname.startsWith("/inventory") || pathname.startsWith("/customers")

            // Portal sub-routes that are Customer-specific
            const isCustomerPortalRoute =
                pathname.startsWith("/portal/loans") ||
                pathname.startsWith("/portal/items") ||
                pathname.startsWith("/portal/wallet") ||
                pathname.startsWith("/portal/watchlist")

            // 3. Auth Routes Logic
            if (isAuthRoute) {
                if (isLoggedIn) {
                    if (userRole === "CUSTOMER") {
                        return NextResponse.redirect(new URL("/portal", nextUrl.nextUrl))
                    }
                    if (userRole === "ADMIN" || userRole === "STAFF") {
                        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl.nextUrl))
                    }
                }
                return true
            }

            // 4. Admin Routes Protection
            if (isAdminRoute) {
                if (!isLoggedIn) return false
                if (userRole !== "ADMIN" && userRole !== "STAFF") {
                    // Redirect unauthorized users to portal
                    return NextResponse.redirect(new URL("/portal", nextUrl.nextUrl))
                }
                return true
            }

            // 5. Dashboard Routes Protection (Staff/Admin)
            if (isDashboardRoute) {
                if (!isLoggedIn) return false
                if (userRole === "CUSTOMER") {
                    return NextResponse.redirect(new URL("/portal", nextUrl.nextUrl))
                }
                return true
            }

            // 6. Customer Portal Routes Protection
            if (isCustomerPortalRoute) {
                if (!isLoggedIn) return false
                if (userRole !== "CUSTOMER") {
                    return NextResponse.redirect(new URL("/portal", nextUrl.nextUrl))
                }
                return true
            }

            // 7. Password Expiry Check (Req 4b)
            if (isLoggedIn && auth?.user) {
                // @ts-ignore
                const lastSet = auth.user.passwordLastSet as string | undefined
                if (lastSet) {
                    const days = (new Date().getTime() - new Date(lastSet).getTime()) / (1000 * 60 * 60 * 24)
                    const isExpired = days > 42
                    const isChangePasswordPage = pathname === "/portal/profile" || pathname.startsWith("/api/") // Allow profile & APIs

                    if (isExpired && !isChangePasswordPage) {
                        // Force redirect to profile to change password
                        return NextResponse.redirect(new URL("/portal/profile?error=password_expired", nextUrl.nextUrl))
                    }
                }
            }

            // 8. General Portal Access
            if (pathname.startsWith("/portal")) {
                const isPublicPortal = pathname.startsWith("/portal/auctions") ||
                    pathname.startsWith("/portal/about") ||
                    pathname.startsWith("/portal/contact") ||
                    pathname.startsWith("/portal/education")

                if (isPublicPortal) return true

                if (pathname === "/portal") {
                    if (!isLoggedIn) return NextResponse.redirect(new URL("/portal/auctions", nextUrl.nextUrl))
                    // Allow Admins/Staff to view the portal dashboard (Overview)
                }

                if (!isLoggedIn) return false
                return true
            }

            return true
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                // @ts-ignore
                session.user.role = token.role
                // @ts-ignore
                session.user.verificationStatus = token.verificationStatus
                // @ts-ignore
                session.user.idImage = token.idImage
                // @ts-ignore
                session.user.passwordLastSet = token.passwordLastSet
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore
                token.role = user.role
                // @ts-ignore
                token.verificationStatus = user.verificationStatus
                // @ts-ignore
                token.idImage = user.idImage
                // @ts-ignore
                token.passwordLastSet = user.passwordLastSet
            }
            return token
        },
    },
    providers: [],
} satisfies NextAuthConfig
