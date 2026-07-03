'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})

type LoginInput = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )

  return (
    <main style={{minHeight:'100vh',display:'flex',fontFamily:'Inter,system-ui,sans-serif',background:'#F8FAFC'}}>

      {/* LEFT — Branding */}
      <div style={{
        width:'45%',background:'#111827',display:'flex',flexDirection:'column',
        justifyContent:'space-between',padding:'48px',position:'relative',overflow:'hidden',flexShrink:0
      }}>
        <div style={{position:'absolute',top:-120,left:-120,width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,0.35) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-80,right:-80,width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.3) 0%,transparent 70%)',pointerEvents:'none'}}/>

        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:12,position:'relative',zIndex:1}}>
          <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#2563EB,#7C3AED)',display:'grid',placeItems:'center',flexShrink:0}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
              <path d="M6 5v14"/><path d="M11 19V5h7"/><path d="M11 12h5"/>
            </svg>
          </div>
          <span style={{fontWeight:800,fontSize:18,color:'#fff',letterSpacing:'-0.3px'}}>
            Invoice<span style={{background:'linear-gradient(90deg,#60A5FA,#A78BFA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Flow</span>
          </span>
        </div>

        {/* Center */}
        <div style={{position:'relative',zIndex:1}}>
          <h2 style={{fontSize:32,fontWeight:800,color:'#fff',letterSpacing:'-0.8px',lineHeight:1.2,margin:'0 0 16px'}}>
            Bon retour parmi nous 👋
          </h2>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.55)',lineHeight:1.7,margin:'0 0 40px'}}>
            Connectez-vous pour accéder à votre dashboard, gérer vos factures et suivre vos paiements.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {['Tableau de bord en temps réel','Gestion clients & factures','Export PDF professionnel'].map(f => (
              <div key={f} style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',display:'grid',placeItems:'center',flexShrink:0}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:11,height:11}}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{fontSize:13.5,color:'rgba(255,255,255,0.7)',fontWeight:500}}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{fontSize:12,color:'rgba(255,255,255,0.25)',position:'relative',zIndex:1}}>
          © 2026 InvoiceFlow · VOID STUDIO
        </p>
      </div>

      {/* RIGHT — Form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 32px'}}>
        <div style={{width:'100%',maxWidth:420}}>
          <h1 style={{fontSize:26,fontWeight:800,color:'#0F172A',letterSpacing:'-0.6px',margin:'0 0 6px'}}>
            Se connecter
          </h1>
          <p style={{fontSize:14,color:'#64748B',margin:'0 0 32px'}}>
            Pas encore de compte ?{' '}
            <a href="/register" style={{color:'#2563EB',fontWeight:600,textDecoration:'none'}}>S'inscrire gratuitement</a>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:20}}>

            {/* Email */}
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#374151',marginBottom:6}}>Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="vous@example.com"
                style={{
                  width:'100%',height:44,border:`1px solid ${errors.email?'#FCA5A5':'#E2E8F0'}`,
                  borderRadius:10,padding:'0 14px',fontSize:14,color:'#0F172A',
                  background:'#F8FAFC',outline:'none',fontFamily:'inherit',boxSizing:'border-box'
                }}
                onFocus={e => e.target.style.borderColor='#2563EB'}
                onBlur={e => e.target.style.borderColor=errors.email?'#FCA5A5':'#E2E8F0'}
              />
              {errors.email && <p style={{fontSize:12,color:'#DC2626',margin:'4px 0 0'}}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <label style={{fontSize:13,fontWeight:600,color:'#374151'}}>Mot de passe</label>
                <a href="#" style={{fontSize:12,color:'#2563EB',textDecoration:'none',fontWeight:500}}>Mot de passe oublié ?</a>
              </div>
              <div style={{position:'relative'}}>
                <input
                  {...register('password')}
                  type={showPassword?'text':'password'}
                  placeholder="••••••••"
                  style={{
                    width:'100%',height:44,border:`1px solid ${errors.password?'#FCA5A5':'#E2E8F0'}`,
                    borderRadius:10,padding:'0 44px 0 14px',fontSize:14,color:'#0F172A',
                    background:'#F8FAFC',outline:'none',fontFamily:'inherit',boxSizing:'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor='#2563EB'}
                  onBlur={e => e.target.style.borderColor=errors.password?'#FCA5A5':'#E2E8F0'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',
                  background:'none',border:'none',cursor:'pointer',color:'#94A3B8',padding:0,display:'grid',placeItems:'center'
                }}>
                  {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                </button>
              </div>
              {errors.password && <p style={{fontSize:12,color:'#DC2626',margin:'4px 0 0'}}>{errors.password.message}</p>}
            </div>

            {error && (
              <div style={{background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#DC2626'}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                height:44,background:'linear-gradient(135deg,#2563EB 0%,#4F46E5 50%,#7C3AED 100%)',
                color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:600,
                cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,
                fontFamily:'inherit',transition:'all 0.2s',
                boxShadow:'0 4px 14px -4px rgba(79,70,229,0.5)'
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{fontSize:12,color:'#94A3B8',textAlign:'center',marginTop:32}}>
            Protégé par Supabase Auth · Données chiffrées
          </p>
        </div>
      </div>
    </main>
  )
}