import AdminNav from './AdminNav'
import { useState } from 'react'

function AdminDashboard(){
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState('all')

    const options = [
        { value: 'all', label: 'All' },
        { value: 'teachers', label: 'Teachers' },
        { value: 'students', label: 'Students' },
    ]

    return(
        <main className="min-h-screen w-full flex">            
            <section className="absolute content-start md:static max-md:w-20 max-md:bg-[#111629]/0 bg-[#111629] p-5 z-999">
                <AdminNav/>
            </section>
            <section className="flex-1 bg-white p-5">  
                <div className='flex justify-between max-md:mt-10'>
                    <div>
                    <h2 className='text-2xl font-bold'>Account Management</h2>
                    <p className='text-muted-foreground'>Manage Teacher and student accounts</p>
                    </div>
                    <div>
                        <button className='px-3 py-2 text-white rounded-2xl bg-blue-500 hover:bg-blue-400 font-semibold'>+ Add Account</button>
                    </div>
                </div>
                <div className='mt-5 flex max-md:flex-col justify-between gap-1'>
                    <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" required placeholder="Seach by name, emaikl, or student ID..." type="text" value={search} onChange={(e) => setSearch(e.target.value)}/>

                    <div className="flex gap-2">
                        {options.map((opt) => (
                            <label key={opt.value} className="cursor-pointer">
                            <input type="radio" name="option" value={opt.value} checked={selected === opt.value} onChange={() => setSelected(opt.value)} className="sr-only"/>
                            <span
                                className={`
                                inline-block px-4 py-2.5 rounded-xl border-2 font-medium transition-all
                                ${selected === opt.value
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/50'
                                }
                                `}
                            >
                                {opt.label}
                            </span>
                            </label>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}

export default AdminDashboard