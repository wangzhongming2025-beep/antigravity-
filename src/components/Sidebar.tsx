'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Vision Detective Pro', path: '/', icon: '🔍', label: 'Core Detection' },
        { name: 'Eye Exercises', path: '/exercises', icon: '🧘', label: 'Support Tools' },
        { name: 'Health Report', path: '/report', icon: '📊' },
        { name: 'Color Test', path: '/color-test', icon: '🎨' },
    ];

    return (
        <aside className="w-[280px] h-full bg-black/40 backdrop-blur-3xl border-r border-white/10 flex flex-col p-8 z-10 max-md:w-20 max-md:p-4">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)]">
                    👁️
                </div>
                <div className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white to-primary bg-clip-text text-transparent max-md:hidden">
                    VisionGuard AI
                </div>
            </div>

            <nav className="flex-1">
                {navItems.map((item, index) => (
                    <React.Fragment key={item.path}>
                        {item.label && (
                            <div className="text-[11px] uppercase text-text-dim tracking-[2px] mb-5 pl-2 mt-6 first:mt-0 max-md:hidden">
                                {item.label}
                            </div>
                        )}
                        <Link
                            href={item.path}
                            className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 mb-2 cursor-pointer border border-transparent hover:text-primary hover:bg-white/5 ${pathname === item.path
                                    ? 'text-white bg-primary/10 border-primary/20 shadow-lg'
                                    : 'text-text-dim'
                                }`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="max-md:hidden">{item.name}</span>
                        </Link>
                    </React.Fragment>
                ))}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-5">
                <Link href="/settings" className="flex items-center gap-3 p-4 rounded-xl text-text-dim hover:text-primary hover:bg-white/5">
                    <span className="text-lg">⚙️</span>
                    <span className="max-md:hidden">System Settings</span>
                </Link>
                <Link href="/cn" className="flex items-center gap-3 p-4 rounded-xl text-white hover:text-primary bg-white/5 mt-2">
                    <span className="text-lg">🇨🇳</span>
                    <span className="max-md:hidden">中文版 (Chinese)</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
