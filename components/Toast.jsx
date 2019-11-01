const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');

const Clickable = AsyncComponent.from(getModuleByDisplayName('Clickable'));

Object.assign(exports, {
  Button: AsyncComponent.from(getModule(m => m.name === 'm'))
});

(async () => {
  const Button = await getModule(m => m.name === 'm', true, true);
  [ 'Colors', 'Hovers', 'Looks', 'Sizes' ].forEach(prop => exports.Button[prop] = Button[prop]);
})();

/* eslint-disable multiline-ternary */
module.exports = class Toast extends React.PureComponent {
  constructor (props) {
    super(props);

    this.main = props.main;
    this.state = {
      leaving: false
    };
  }

  render () {
    const { state } = this;
    const { Button } = exports;

    return (
      <div
        className={[ 'powercord-toast', state.leaving ? 'leaving' : '' ].filter(Boolean).join(' ')}
        style={this.props.style}
      >
        {this.props.header && (
          <div className='header'>
            <div className='fad fa-info-circle fa-fw' style={{ marginRight: '5px' }} />
            {this.props.header}
            <Clickable
              className='dismiss'
              onClick={() => {
                this.setState({ leaving: true });
                return this.main.closeToast(this.props.id);
              }}
            />
          </div>
        )}

        {(this.props.content || this.props.buttons.filter(Boolean).length > 0) && (
          <div className='body'>
            {this.props.content && (
              <div className='content'>
                {this.props.content}
              </div>
            )}

            <div className='buttons'>
              {Array.isArray(this.props.buttons) && (
                this.props.buttons.filter(Boolean).map(button => (
                  <Button
                    className='button'
                    size={button.size
                      ? Button.Sizes[(button.size).toUpperCase()]
                      : Button.Sizes.SMALL}
                    color={button.danger ? Button.Colors.RED : button.color
                      ? Button.Colors[typeof button.color === 'string' ? (button.color).toUpperCase() : '']
                      : Button.Colors.TRANSPARENT}
                    look={button.danger ? Button.Looks.OUTLINED : button.type
                      ? Button.Looks[(button.type).toUpperCase()]
                      : Button.Looks.FILLED}
                    style={button.color ? this.getButtonStyle(button) : null}
                    onClick={() => {
                      if (button.onClick) {
                        button.onClick();
                      }

                      return (this.setState({ leaving: true }), this.main.closeToast(this.props.id));
                    }}
                  >
                    {button.text}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  getButtonStyle (button) {
    let { style } = button;
    const { isValidHex } = getModule([ 'hex2rgb' ], false);

    if (isValidHex(button.color)) {
      style = { backgroundColor: button.color };
    } else {
      let foreground, background;

      if (Array.isArray(button.color)) {
        [ foreground, background ] = button.color;
      } else if (typeof button.color === 'object') {
        ({ foreground, background } = button.color);

        if (button.color.primary || button.color.secondary) {
          ({ primary: foreground, secondary: background } = button.color);
        }
      }

      return { color: foreground && isValidHex(foreground) ? foreground : null,
        borderColor: background && isValidHex(background) ? background : null };
    }

    return style;
  }
};
