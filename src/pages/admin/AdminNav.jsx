function AdminNav(){
    return(
        <>
            <aside className="hidden md:block w-48 bg-nav text-white h-full">
                <ul className="space-y-2">
                    <li>test</li>
                    <li>test</li>
                </ul>
            </aside>
            <button class="md:hidden flex items-center text-white focus:outline-none pl-2">
                <svg class="w-7 h-7 my-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
            
            <aside id="mobileMenu" class="absolute hidden w-full bg-nav text-white">
            <h2 class="text-4xl font-bold mt-4 text-center text-primary">StockEZ</h2>
            <clock/>
            <h2 class="text-2xl font-bold mb-4 p-2 text-primary text-center">{{name}}</h2>
            <ul class="space-y-2 text-center">
                
            </ul>
            </aside>
        </>
    )
}

export default AdminNav