/* eslint-disable import/no-extraneous-dependencies */
import React, { PureComponent } from 'react'
import {
  Dimensions, StyleSheet, Platform, LayoutAnimation,
} from 'react-native'
import PropTypes from 'prop-types'

/** README *
* [1] - wrap any component with styles for landscape.
These styles will be merged with default styles on orientation change
Example:
  const BasicTextInputComponent = ScaledStyleSheet.withLandscape({
    style: styles.textSearchLandscape,
    extraProps: { numberOfLines: 3 },
    type: 'replace',
  })(BasicTextInput) -> @style will be @replaced with the one passed directly into component,
  @extraProps will be pased too
* [2] - wrap any component with styles for landscape.
These styles will be merged with default styles on orientation change
/** README */

class OrientationSensitiveWrapper extends PureComponent {
  static propTypes = {
    type: PropTypes.string,
    animate: PropTypes.bool,
    style: PropTypes.shape({}),
    extraProps: PropTypes.shape({}),
    landscapeStyle: PropTypes.shape({}),
    Component: PropTypes.node.isRequired,
  }

  static defaultProps = {
    style: {},
    type: 'merge',
    animate: true,
    extraProps: {},
    landscapeStyle: {},
  }

  constructor(props) {
    super(props)
    const { width, height } = Dimensions.get('window')
    this.isLandscape = width > height
  }

  componentDidMount() {
    Dimensions.addEventListener('change', this.handleChange)
  }

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleChange)
  }

  render() {
    const { Component } = this.props
    return (
      <Component
        {...this.props}
        style={this.getStyles()}
        {...this.getExtraProps()}
      />
    )
  }

  isLandscape = false

  handleChange = ({ window }) => {
    this.isLandscape = window.width > window.height
    if (this.props.animate) LayoutAnimation.easeInEaseOut()
    this.forceUpdate()
  }

  getExtraProps = () =>
    this.isLandscape
      ? this.props.extraProps
      : {}

  getMergedStyles = () =>
    this.props.style || this.props.landscapeStyle
      ? [
        this.props.style,
        this.isLandscape && this.props.landscapeStyle,
      ]
      : undefined

  getReplacedStyles = () =>
    this.isLandscape
      ? this.props.landscapeStyle
      : this.props.style

  getStyles = () =>
    this.props.type === 'merge'
      ? this.getMergedStyles()
      : this.getReplacedStyles()
}

const { width, height } = Dimensions.get('window')

export const screenWidth = width < height
  ? width
  : height

export const screenHeight = width < height
  ? height
  : width

/** README *
 width: 20, -> width: 20 for iPhones, width: 10 for iPads
 width: [20], -> width: 20 for iPhones, width: 20 for iPads
 width: [5, 20], -> width: 20 for iPhones, width: 5 for iPads

 !!!string values are not scaled!!!
 we can use mixed values too:
 ['100%'<this value will be not scaled>, 250<this value will be scaled>],
 ['center', 'auto'] -> these values will be not scaled
/** README */

class ScaledStyleSheetClass {
  guidelineBaseWidth = 375
  guidelineBaseHeight = 667
  hairlineWidth = StyleSheet.hairlineWidth
  scaleVerticalKeys = []
  ignoreKeys = ['shadowOffset', 'zIndex', 'flex', 'opacity', 'flexGrow', 'flexShrink', 'flexBasis', 'fontWeight', 'transform']
  scaleHorizontalKeys = [
    'minWidth', 'borderRightWidth', 'borderLeftWidth', 'paddingStart', 'paddingStart', 'borderBottomWidth',
    'borderWidth', 'padding', 'paddingTop', 'paddingBottom', 'top', 'bottom', 'paddingVertical', 'paddingHorizontal',
    'margin', 'marginHorizontal', 'marginVertical', 'marginBottom', 'marginTop', 'height', 'width', 'marginLeft',
    'marginRight', 'paddingLeft', 'paddingRight', 'left', 'right', 'borderRadius', 'borderTopWidth', 'marginEnd',
    'marginStart', 'lineHeight',
  ]

  /** functions */
  setGuidelineBaseSize = (width, height) => {
    if (width) {
      this.guidelineBaseWidth = width
    }
    if (height) {
      this.guidelineBaseHeight = height
    }
  }

  setVerticalKeys = (keys = []) => {
    keys.forEach(key => {
      this.scaleVerticalKeys
        .filter(vKey => vKey !== key)
        .push(key)
      this.horizontalKeys
        .filter(hKey => hKey !== key)
      this.ignoreKeys
        .filter(iKey => iKey !== key)
    })
  }

  setHorizontalKeys = (keys = []) => {
    keys.forEach(key => {
      this.scaleVerticalKeys
        .filter(vKey => vKey !== key)
      this.horizontalKeys
        .filter(hKey => hKey !== key)
        .push(key)
      this.ignoreKeys
        .filter(iKey => iKey !== key)
    })
  }

  setIgnoreKeys = (keys = []) => {
    keys.forEach(key => {
      this.scaleVerticalKeys
        .filter(vKey => vKey !== key)
      this.horizontalKeys
        .filter(hKey => hKey !== key)
      this.ignoreKeys
        .filter(iKey => iKey !== key)
        .push(key)
    })
  }

  scaleHorizontalValue = (size) =>
    screenWidth / this.guidelineBaseWidth * size

  scaleVerticalValue = (size) =>
    screenHeight / this.guidelineBaseHeight * size

  selectDevice = (size) =>
    Platform.isPad
      ? size[0]
      : (size[1] || size[0])

  calculateSize = (size) =>
    typeof size === 'string'
      ? size
      : size / 2

  calculateValue = (size) =>
    Array.isArray(size)
      ? this.selectDevice(size)
      : this.selectDevice([this.calculateSize(size), size])

  scaleHorizontal = (size) => {
    const valueToScale = this.calculateValue(size)
    if (typeof valueToScale === 'string') {
      return valueToScale
    }
    return this.scaleHorizontalValue(valueToScale)
  }

  scaleVertical = (size) => {
    const valueToScale = this.calculateValue(size)
    if (typeof valueToScale === 'string') {
      return valueToScale
    }
    return this.scaleVerticalValue(valueToScale)
  }

  setBaseSize = (baseWidth, baseHeight) => {
    this.guidelineBaseWidth = baseWidth
    this.guidelineBaseHeight = baseHeight
  }

  addKeys = (verticalKeys = [], horizontalKeys = []) => {
    const vKeys = typeof verticalKeys === 'string' ? [verticalKeys] : verticalKeys
    const hKeys = typeof horizontalKeys === 'string' ? [horizontalKeys] : horizontalKeys
    this.scaleVerticalKeys = [...this.scaleVerticalKeys, ...vKeys.filter(v => !this.scaleVerticalKeys.includes(v))]
    this.scaleHorizontalKeys = [
      ...this.scaleHorizontalKeys,
      ...hKeys.filter(v => !this.scaleHorizontalKeys.includes(v)),
    ]
  }

  parseStyleObject = (styleObject) => {
    const parsedStyleObject = { ...styleObject }
    const styleObjectKeys = Object.keys(styleObject)
    styleObjectKeys.forEach((key) => {
      if (typeof styleObject[key] !== 'string') {
        const lastKeyChar = key.charAt(key.length - 1)
        if (this.scaleVerticalKeys.includes(key)) {
          parsedStyleObject[key] = this.scaleVertical(styleObject[key])
        } else if (this.scaleHorizontalKeys.includes(key)) {
          parsedStyleObject[key] = this.scaleHorizontal(styleObject[key])
        } else if (lastKeyChar === 'V') {
          parsedStyleObject[this.sliceKey(key)] = this.scaleVertical(styleObject[key])
          delete parsedStyleObject[key]
        } else if (lastKeyChar === 'H') {
          parsedStyleObject[this.sliceKey(key)] = this.scaleHorizontal(styleObject[key])
          delete parsedStyleObject[key]
        } else if (!this.ignoreKeys.includes(key) && lastKeyChar !== 'I') {
          parsedStyleObject[key] = this.calculateValue(styleObject[key])
        }
      }
    })
    return parsedStyleObject
  }

  sliceKey = key =>
    key.slice(0, key.length - 2)

  create = (styles) => {
    const parsedStyles = {}
    const stylesArrayKeys = Object.keys(styles)

    stylesArrayKeys.forEach((key) => {
      parsedStyles[key] = this.parseStyleObject(styles[key])
    })

    return StyleSheet.create(parsedStyles)
  }

  withLandscape = ({
    animate, // animate changes or not
    style, // landscape styles
    type, // 'merge' (default) || 'replace' -> treat of styles
    extraProps, // additional props merged into component on landscape
  }) => (Component) => (props) => (
    <OrientationSensitiveWrapper
      {...props}
      type={type}
      animate={animate}
      Component={Component}
      landscapeStyle={style}
      extraProps={extraProps}
    />
  )
}

export default new ScaledStyleSheetClass()
