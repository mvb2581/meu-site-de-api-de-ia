import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Erro de renderização na aplicação:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container py-5 text-center" role="alert">
          <h1 className="h3 fw-bold">Algo deu errado</h1>
          <p className="text-muted">A página encontrou um erro inesperado.</p>
          <button className="btn au-btn-primary" onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
