import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, NavLink, Switch, Redirect } from 'react-router-dom'
import Progress from './components/Progress'
import UnderlineInput from './components/UnderlineInput'
import UriListItem from './containers/UriListItem'
import PublisherListItem from './containers/PublisherListItem'
import Icon from './components/Icon'
import IconButton from './components/IconButton'
import ConfirmIconButton from './containers/ConfirmIconButton'
import reducer from './reducers'
import { fetchData, createNewUrl, setEditing, editUser, createNewPublisher, regenerateSigningSecret, toggleMenu } from './actions'

import '../styles/index.scss'

const uriRegex = /^(https?:\/\/)(.+\.)*(.+\.).{1,}(:\d+)?/i

class App extends React.Component {
  constructor () {
    super()
    this.state = {
      error: '',
      user: {
        id: '',
        email: '',
        password: '',
        currentPassword: '',
        signing_secret: ''
      },
      signingSecretShown: false,
      urls: [],
      publishers: [],
      newPublisher: { name: '', url: '' },
      editingUrl: null,
      editingPublisher: null,
      working: false,
      navMenu: false
    }

    this.dispatch = this.dispatch.bind(this)
    this.getRegisteredUris = this.getRegisteredUris.bind(this)
    this.setUserValue = this.setUserValue.bind(this)
    this.saveUser = this.saveUser.bind(this)
    this.getRegisteredPublishers = this.getRegisteredPublishers.bind(this)
    this.setPublisherValue = this.setPublisherValue.bind(this)
    this.toggleRevealSecret = this.toggleRevealSecret.bind(this)
  }
  dispatch (action) {
    if (!action) throw new Error('dispatch: missing action')
    if (action instanceof Function) {
      action(this.dispatch, () => this.state)
    } else {
      const changes = reducer(this.state, action)
      if (!changes || !Object.keys(changes).length) return
      this.setState({
        ...changes
      })
    }
  }
  componentDidMount () {
    this.dispatch(fetchData())
  }
  setPublisherValue (which, e) {
    this.setState({
      newPublisher: {
        ...this.state.newPublisher,
        [which]: e.target.value
      }
    })
  }
  setUserValue (which, e) {
    this.setState({
      user: {
        ...this.state.user,
        [which]: e.target.value
      }
    })
  }
  saveUser () {
    this.dispatch(editUser(this.state.user))
    this.setState({
      user: {
        ...this.state.user,
        email: this.state.user.email,
        password: '',
        currentPassword: ''
      }
    })
  }
  getRegisteredUris () {
    return this.state.urls.map((item, i) => {
      return (<UriListItem
        key={i}
        dispatch={this.dispatch}
        item={item}
        editing={this.state.editingUrl === item.id} />)
    })
  }
  getRegisteredPublishers () {
    return this.state.publishers.map((item, i) => {
      return (<PublisherListItem
        key={i}
        editing={this.state.editingPublisher === item.id}
        dispatch={this.dispatch}
        item={item} />)
    })
  }
  toggleRevealSecret () {
    this.setState({
      signingSecretShown: !this.state.signingSecretShown
    })
  }
  render () {
    return (
      <Router>
        <div className={'root-container flex-container two-panels' + (this.state.navMenu ? ' nav-active' : '')} onClick={() => this.dispatch(setEditing(null))}>
          <aside className='nav nav-left'>
            <header>
              <h1 className='flex-container'><IconButton icon='menu' className='menu-small' onClick={() => this.dispatch(toggleMenu())} /><span className='flex'>River of Ebooks</span></h1>
              <h2 className='flex-container'>
                <span className='flex'>{this.state.user.email}</span>
                <a href='/logout'>Log out</a>
              </h2>
            </header>
            <ul>
              <li><NavLink to='/keys' className='flex-container'><Icon icon='key' /><span className='flex'>Publishing keys</span></NavLink></li>
              <li><NavLink to='/targets' className='flex-container'><Icon icon='transfer-right' /><span className='flex'>Push URIs</span></NavLink></li>
              <li><NavLink to='/account' className='flex-container'><Icon icon='account' /><span className='flex'>My account</span></NavLink></li>
              {(this.state.user.id === 1 || this.state.user.admin) &&
                <li><a href='/admin' className='flex-container'><Icon icon='flash' /><span className='flex'>Admin</span></a></li>
              }
            </ul>
          </aside>
          <section className={'content flex' + (this.state.working ? ' working' : '')}>
            <Progress bound />
            {this.state.error && <div className='error-box'>{this.state.error}</div>}
            <Switch>
              <Route path='/targets' exact children={props => (
                <div>
                  <header className='flex-container'>
                    <div className='flex'>
                      <h1>Push URIs</h1>
                      <h2>Newly published books will be sent to these addresses.</h2>
                    </div>
                    <button className='btn' onClick={() => this.dispatch(createNewUrl())}>New address</button>
                  </header>
                  <ul className='list'>
                    {this.getRegisteredUris()}
                  </ul>
                </div>
              )} />
              <Route path='/keys' exact children={props => (
                <div>
                  <header className='flex-container'>
                    <div className='flex'>
                      <h1>Publishing keys</h1>
                      <h2>If you own a publishing site, generate a publishing key for it here.</h2>
                    </div>
                  </header>
                  <div className='creator flex-container cols'>
                    <UnderlineInput
                      className='flex stack-h'
                      placeholder='Website name'
                      value={this.state.newPublisher.name}
                      onChange={e => this.setPublisherValue('name', e)} />
                    <UnderlineInput
                      className='flex stack-h'
                      type='text'
                      placeholder='Website domain (starts with http or https)'
                      value={this.state.newPublisher.url}
                      pattern={uriRegex}
                      onChange={(e) => this.setPublisherValue('url', e)} />
                    <button className='btn' onClick={() => this.dispatch(createNewPublisher(this.state.newPublisher))}>Create keys</button>
                  </div>
                  <ul className='list'>
                    {this.getRegisteredPublishers()}
                  </ul>
                </div>
              )} />

              <Route path='/account' exact children={props => (
                <div>
                  <header className='flex-container'>
                    <div className='flex'>
                      <h1>My account</h1>
                      <h2>User account settings</h2>
                    </div>
                  </header>
                  <section className='inputs'>
                    <UnderlineInput
                      placeholder='Email address'
                      value={this.state.user.email}
                      pattern={/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/}
                      onChange={(e) => this.setUserValue('email', e)} />
                    <UnderlineInput
                      placeholder='Password'
                      type='password'
                      value={this.state.user.password}
                      onChange={(e) => this.setUserValue('password', e)} />
                    <UnderlineInput
                      placeholder='Current password'
                      type='password'
                      value={this.state.user.currentPassword}
                      onChange={(e) => this.setUserValue('currentPassword', e)} />
                    <div className='buttons'>
                      <button className='btn' onClick={this.saveUser}>Save</button>
                    </div>
                  </section>
                  <section className='details'>
                    <div className='row'>
                      <h3>Signing secret</h3>
                      <h4>RoE signs the requests we send to you using this unique secret. Confirm that each request comes from RoE by verifying its unique signature.</h4>
                      <div className='flex-container'>
                        <input className='flex' defaultValue={this.state.user.signing_secret} readOnly type={this.state.signingSecretShown ? 'text' : 'password'} />
                        <IconButton onClick={this.toggleRevealSecret} icon={this.state.signingSecretShown ? 'eye-close' : 'eye'} />
                        <ConfirmIconButton onClick={() => this.dispatch(regenerateSigningSecret())} icon={'refresh'} />
                      </div>
                    </div>
                  </section>
                </div>
              )} />

              <Route path='/' render={() => <Redirect to='/keys' />} />
            </Switch>
          </section>
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
