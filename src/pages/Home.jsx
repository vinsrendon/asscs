import {NavLink, useNavigate } from 'react-router'
import { useState } from 'react';
import axios from '../../axios-config.js';
import arrow from '../assets/arrow-right-stroke.svg'
import scan from '../assets/scan.svg'
import sheet from '../assets/sheet.webp'

function Home(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const login = async (e) => {
        e.preventDefault()

        setLoading(true)

        try {
            const response = await axios.post(
                '/login',
                {
                    email: email,
                    password: password
                }
            )
            console.log('Success:', response.data);                       
            setEmail('')
            setPassword('')
            if(response.data?.role === "ADMIN"){
                navigate('/admindash')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    };

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
                            <h2 className="text-3xl font-bold text-foreground mb-1">Welcome back</h2>
                            <p className="text-muted-foreground text-sm">Sign in to access your dashboard.</p>
                        </div>
                        <form className="space-y-4" onSubmit={login}>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-semibold text-foreground">Email</label>
                                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" required placeholder="email@edu.ph" type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-semibold text-foreground">Password</label>
                                <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-foreground focus:outline-none focus:border-primary transition-all text-sm" required placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>
                            <button disabled={loading} className="w-full group flex items-center justify-center gap-2 px-6 py-3.5 mt-2 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200" type="submit">
                            {loading ? 'Signing In...' : 'Sign In'} <img src={arrow} alt="right arrow" />
                            </button>
                        </form>
                        <p className='mt-7 text-center text-sm text-muted-foreground'>
                            Don't have an account? 
                            <NavLink to="/register" className='font-semibold text-primary hover:underline'> Create account</NavLink>
                        </p>
                    </div>
                </div>          
            </section>
            <section className="hidden lg:block relative flex-1 bg-slate-900 overflow-hidden">                       
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

export default Home