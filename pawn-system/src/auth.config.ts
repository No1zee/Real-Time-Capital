
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
            const userRole = auth?.user?.role

            const isOnDashboard = nextUrl.nextUrl.pathname.startsWith("/loans") ||
                nextUrl.nextUrl.pathname.startsWith("/inventory") ||
                nextUrl.nextUrl.pathname.startsWith("/customers")

            const isOnPortal = nextUrl.nextUrl.pathname.startsWith("/portal")

            const isAuthRoute = nextUrl.nextUrl.pathname.startsWith("/login") ||
                nextUrl.nextUrl.pathname.startsWith("/register")

            if (nextUrl.nextUrl.pathname === "/") {
                return NextResponse.redirect(new URL("/portal/auctions", nextUrl.nextUrl))
            }

            if (isOnDashboard) {
                if (isLoggedIn) {
                    if (userRole === "CUSTOMER") {
                        return NextResponse.redirect(new URL("/portal/auctions", nextUrl.nextUrl))
                    }
                    return true
                }
                return false // Redirect to login
            }

            if (isOnPortal) {
                const isAuctionPage = nextUrl.nextUrl.pathname.startsWith("/portal/auctions")

                if (isAuctionPage) {
                    return true
                }

                if (isLoggedIn) {
                    if (userRole !== "CUSTOMER") {
                        return NextResponse.redirect(new URL("/", nextUrl.nextUrl))
                    }
                    return true
                }

                // If guest tries to access portal root, redirect to auctions
                if (nextUrl.nextUrl.pathname === "/portal") {
                    return NextResponse.redirect(new URL("/portal/auctions", nextUrl.nextUrl))
                }

                return false // Redirect to login for other protected portal pages
            }

            if (isAuthRoute) {
                if (isLoggedIn) {
                    if (userRole === "CUSTOMER") {
                        return NextResponse.redirect(new URL("/portal", nextUrl.nextUrl))
                    }
                    return NextResponse.redirect(new URL("/", nextUrl.nextUrl))
                }
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
