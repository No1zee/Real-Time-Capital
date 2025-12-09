
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
                    // Staff/Admin really shouldn't be in "My Loans" etc unless strictly debugging, 
                    // but per requirement we block them to keep UI clean/separated
                    return NextResponse.redirect(new URL("/portal", nextUrl.nextUrl))
                }
                return true
            }

            // 7. General Portal Access (Auctions, etc.)
            // Allow anyone (even guests for public areas if desired, but here we likely block guests except specifically allowed)
            // Current logic seems to allow guests on /portal/auctions but block elsewhere?
            // Let's preserve existing guest logic for portal
            if (pathname.startsWith("/portal")) {
                const isPublicPortal = pathname.startsWith("/portal/auctions") ||
                    pathname.startsWith("/portal/about") ||
                    pathname.startsWith("/portal/contact") ||
                    pathname.startsWith("/portal/education")

                if (isPublicPortal) return true

                // Dashbaord /portal root needs login
                if (pathname === "/portal" && !isLoggedIn) {
                    return NextResponse.redirect(new URL("/portal/auctions", nextUrl.nextUrl))
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
            }
            return token
        },
    },
    providers: [],
} satisfies NextAuthConfig
