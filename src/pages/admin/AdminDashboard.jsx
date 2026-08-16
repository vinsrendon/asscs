import { NavLink } from 'react-router'
import hat from '../../assets/hat.svg'
import user from '../../assets/user.svg'
import scan from '../../assets/scan.svg'
import sheet from '../../assets/sheet.webp'

function AdminDashboard(){
    return(
        <main className="min-h-screen w-full flex">            
            <section className="w-full lg:w-120 flex flex-col justify-center px-8 sm:px-16 bg-background relative z-10 overflow-y-auto py-10">
                <div className="w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                        <div className='bg-primary p-3 rounded-4xl shadow-lg shadow-primary/30'>
                            <img src={scan} alt="scan icon" />
                        </div>   
                        <div>
                            <h1 className='font-bold text-2xl text-foreground leading-none'>AutoCheck</h1>
                            <p className='text-sm font-semibold text-primary'>Academic System</p>
                        </div>     
                    </div>
                    <div>
                        <div className="mb-7">
                            <h2 className="text-3xl font-bold text-foreground mb-1">Create account</h2>
                            <p className="text-muted-foreground text-sm">Who are you registering as?</p>
                        </div>
                        <div className="space-y-3">
                            <NavLink to="/teacherregistration" className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-200">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                                    <img src={user} alt="user icon" className='text-blue-500'/>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-foreground">Teacher</p>
                                    <p className="text-xs text-muted-foreground">Manage exams, scan sheets, and view results</p>
                                </div>
                            </NavLink>                           
                            
                            <NavLink to="/studdentregistration" className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 duration-200">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                                    <img src={hat} alt="scan icon" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-foreground">Applicant</p>
                                    <p className="text-xs text-muted-foreground">Register for entrance exam and view your scores</p>
                                </div>
                            </NavLink>
                        </div>
                        <p className='mt-7 text-center text-sm text-muted-foreground'>
                            Already have an account?
                            <NavLink to="/" className='font-semibold text-primary hover:underline'> Sign In</NavLink>
                        </p>
                    </div>
                </div>          
            </section>
            <section className="flex-1 bg-slate-900 overflow-hidden">                       
                <div className="absolute inset-0 bg-linear-to-tr from-primary/80 to-transparent mix-blend-multiply z-10"></div>    
                <img className='absolute inset-0 w-full h-full object-cover opacity-80' src={sheet}/>        
                                    
                <div className='absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center text-white'>
                    <div className='bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-3xl max-w-lg'>
                        <h3 className='text-3xl font-bold mb-4'>Automate your entrance exam workflow</h3>
                        <p className='text-slate-300 text-lg leading-relaxed'>Instantly scan, grade, and analyze multiple-choice answer sheets with our AI-powered system. Save hours of manual checking.</p>
                    </div>
                </div> 
            </section>
        </main>
    )
}

export default AdminDashboard