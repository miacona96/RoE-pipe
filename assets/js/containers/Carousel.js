import React from 'react'
import STYLE from '../../styles/shared/carousel.scss'

class Carousel extends React.Component {
  constructor () {
    super()
    this.getWidth = this.getWidth.bind(this)
    this.getOffset = this.getOffset.bind(this)
  }
  getWidth () {
    return this.props.children.length * 450
  }
  getOffset () {
    return -this.props.position * 450
  }
  render () {
    return (
      <section className='carousel-container'>
        <div className='carousel' style={{width: this.getWidth(), left: this.getOffset()}}>
          {this.props.children}
        </div>
      </section>
    )
  }
}

const CarouselItem = props => (
  <div className='carousel-item'>
    <header className='modal-header'>
      <h1>{props.header}</h1>
      {props.headerExtraContent}
    </header>
    {props.inputs}
    <span className='carousel-error'>{props.error}</span>
    <div className='button-row'>
      <a href='#' onClick={props.onSmallButtonClick}>{props.smallButton}</a>
      <button className='btn btn-primary' onClick={props.onButtonClick} >
        {props.button}
      </button>
    </div>
    {props.footer &&
    <footer className='footer-row'>
      <a href='#'>{props.footer}</a>
    </footer>}
  </div>
)

export default Carousel
export {
  CarouselItem
}
