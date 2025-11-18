
import React, { useState } from 'react'
import { User, Lock, School } from 'lucide-react'
import { api } from '../lib/api'
import '../Styles/Auth.css'

export function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Connexion
        const user = await api.login(formData.email, formData.password)
        onLogin(user)
      } else {
        // Création de compte
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas')
          return
        }
        const user = await api.createOperator({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
        onLogin(user)
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="text-center">
          <div className="auth-logo">
            <School className="auth-logo-icon" />
          </div>
          <h2 className="auth-title">
            Groupe Scolaire Bilingue La Grace De Dieu
          </h2>
          <p className="auth-subtitle">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez un compte opérateur'}
          </p>
        </div>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nom complet
                </label>
                <div className="input-container">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Votre nom complet"
                  />
                  <User className="input-icon" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <div className="input-container">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="votre@email.com"
                />
                <User className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="input-container">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Votre mot de passe"
                />
                <Lock className="input-icon" />
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmer le mot de passe
                </label>
                <div className="input-container">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Confirmer votre mot de passe"
                  />
                  <Lock className="input-icon" />
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p className="error-text">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer le compte')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="toggle-button"
              >
                {isLogin ? "Créer un compte opérateur" : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

















