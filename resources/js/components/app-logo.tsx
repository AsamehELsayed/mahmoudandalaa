import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                <AppLogoIcon className="size-4 text-white" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-serif font-bold text-stone-800 tracking-wide dark:text-stone-200">NJM SOLUTIONS</span>
                <span className="text-[10px] text-stone-400 font-sans tracking-widest uppercase dark:text-stone-500">Wedding Center</span>
            </div>
        </>
    );
}
