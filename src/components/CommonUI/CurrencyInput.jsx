import React, { PureComponent } from 'react';

import Chevron from './Chevron';

import { COLORS } from '../../constants';
import { formatCurrency } from '../../helpers';


class CurrencyInput extends PureComponent {

	state = {
		currencyDropdown: false,
		currencySearchFocus: false,
		dropdownTop: 0,
		currencySearch: '',
		currencyHover: '',
		valueFormat: '',
		valueString: '',
		currency: '',
		hover: '',
		focus: false,
		error: ''
	};

	constructor (props) {

		super(props);

		this.inputCurrencyContainer = React.createRef();
		this.inputCurrencyField = React.createRef();
		this.currencyDropdown = React.createRef();
		this.inputAmount = React.createRef();
		this.container = React.createRef();
	}

	componentDidMount = () => {

		const { defaultCurrency, currencies } = this.props;
		const currencyParams = currencies[defaultCurrency];
		const initialValue = String(currencyParams.i);

		const coords = this.container.current.getBoundingClientRect();

		this.setState({
			dropdownTop: coords.bottom,
			valueString: initialValue,
			currency: defaultCurrency
		});

		this.format({
			currency: defaultCurrency,
			value: initialValue
		});

		window.addEventListener('click', this.handleSelectCurrencyOutsideClick);
		window.addEventListener('keydown', this.handleCurrencySelectKeyPress);
	};

	componentWillUnmount = () => {

		window.removeEventListener('click', this.handleSelectCurrencyOutsideClick);
		window.removeEventListener('keydown', this.handleCurrencySelectKeyPress);
	};

	scrollToCurrencySelection = ({ currency }) => {

		const el = document.getElementById(`currency_selection_item_${currency.toLowerCase()}`);

		if (el) {

			el.scrollIntoView({
				block: 'nearest',
				inline: 'nearest'
			});	
		}
	};

	handleCurrencySelectKeyPress = (e) => {

		const { currencyHover, currencySearch } = this.state;

		const currencyList = Object.keys(this.props.currencies).filter(symbol => {
			return !currencySearch || symbol.indexOf(currencySearch) !== -1;
		});

		const currentHoverIndex = currencyHover ? currencyList.indexOf(currencyHover) : -1;

		if (e.code === 'ArrowDown') {

			if (currentHoverIndex < currencyList.length - 1) {

				this.setState({ currencyHover: currencyList[currentHoverIndex + 1] });

				this.scrollToCurrencySelection({
					currency: currencyList[currentHoverIndex + 1]
				});
			}

		} else if (e.code === 'ArrowUp') {

			if (currentHoverIndex > 0 ) {

				this.setState({ currencyHover: currencyList[currentHoverIndex - 1] });

				this.scrollToCurrencySelection({
					currency: currencyList[currentHoverIndex - 1]
				});
			}

		} else if (e.code === 'Enter') {

			if (this.state.focus) { // Inputting amount

				if (this.inputAmount.current) {

					this.inputAmount.current.blur();
				}

			} else {

				if (currencyHover) {

					this.handleSelectCurrency({
						currency: currencyHover
					});

				} else if (currencySearch.length === 3 && currencyList.indexOf(currencySearch) !== -1) {

					this.handleSelectCurrency({
						currency: currencySearch
					});
				}
			}
		}
	};

	handleSelectCurrencyOutsideClick = (e) => {

		if (this.inputCurrencyContainer.current) {

			if (!this.inputCurrencyContainer.current.contains(e.target)) {

				this.setState({
					currencySearchFocus: false,
					currencyDropdown: false,
					currencySearch: '',
					currencyHover: ''
				});
			}
		}
	};

	handleSelectCurrency = ({ currency }) => {

		const currencyParams = this.props.currencies[currency];
		const valueString = String(currencyParams.i);

		this.setState({
			currencyDropdown: false,
			currencySearchFocus: false,
			currencyHover: '',
			currencySearch: '',
			hover: '',
			valueString,
			currency
		});

		this.format({
			value: valueString,
			currency
		});

		if (this.inputCurrencyField.current) {

			this.inputCurrencyField.current.blur();
		}
	};

	handleCurrencySearchChange = (e) => {

		let s = e.target.value || '';

		if (s.length > 3) {
			s = s.substring(0, 3);
		}

		this.setState({
			currencySearch: s.toUpperCase()
		});
	};

	handleChange = (e) => {

		this.setState({
			valueString: e.target.value/*.split('').filter(c => {
				return (`0123456789., `).indexOf(c) !== -1;
			}).join('')*/
		});
	};

	handleFocus = () => {

		this.setState({
			focus: true
		});
	};

	handleBlur = () => {

		this.setState({ focus: false });

		this.format({
			currency: this.state.currency,
			value: this.state.valueString
		});
	};

	format = ({ value, currency }) => {

		const { valid, number, formatted, formatter } = formatCurrency(value, { currency });

		if (valid) {

			this.setState({
				valueFormat: formatted,
				error: ''
			});

		} else {

			this.setState({
				error: 'Invalid Format',
			});
		}

		if (this.props.onValueChanged) {

			const minimum = this.props.currencies[currency].m;
			const maximum = this.props.currencies[currency].x;

			let amountError = '';

			if (number < minimum) {
				amountError = `Minimum amount is ${formatter.format(minimum)}`;
			} else if (number > maximum) {
				amountError = `Maximum amount is ${formatter.format(maximum)}`;
			}

			this.props.onValueChanged({
				amount: number,
				amountError,
				currency
			});
		}
	};

	render = () => {

		const { focus, error, hover, currencyDropdown, currencySearch } = this.state;
		const { currencySelectable } = this.props;

		return (
			<div ref={this.container} style={styles.container}>
				<div style={styles.inputContainer}>
					<input
						value={focus || error ? this.state.valueString : this.state.valueFormat}
						style={styles.inputAmount(this.state)}
						onMouseOver={() => this.setState({ hover: 'amount' })}
						onMouseOut={() => this.setState({ hover: '' })}
						onChange={this.handleChange}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur}
						ref={this.inputAmount}
					/>
					<div>
						<div
							style={{
								width: currencySelectable === false ? null : 75,
								height: 40,
								cursor: currencySelectable === false ? 'default' : 'pointer',
								display: 'flex',
								alignItems: 'center',
								background: currencyDropdown || hover === 'currency' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)'
							}}
							onMouseOver={currencySelectable === false ? undefined : () => this.setState({ hover: 'currency' })}
							onMouseOut={currencySelectable === false ? undefined : () => this.setState({ hover: '' })}
							onClick={currencySelectable === false ? undefined : () => {
								this.setState({ currencyDropdown: !currencyDropdown });
								if (this.inputCurrencyField.current && !currencyDropdown) {
									this.inputCurrencyField.current.focus();
								}
							}}
							ref={this.inputCurrencyContainer}
						>
							<input
								disabled={currencySelectable === false}
								value={this.state.currencySearchFocus ? this.state.currencySearch : this.state.currency.toUpperCase()}
								onFocus={() => this.setState({ currencySearchFocus: true, currencyDropdown: true, currencySearch: '' })}
								onBlur={() => this.setState({ currencySearchFocus: false })}
								onClick={(e) => e.stopPropagation()}
								onChange={this.handleCurrencySearchChange}
								style={styles.inputCurrency(this.state)}
								ref={this.inputCurrencyField}
							/>
							{currencySelectable !== false ? (<Chevron
								pointing={currencyDropdown ? 'up' : 'down'}
								dimension={8}
								style={{
									color: 'rgba(255,255,255,0.85)',
									opacity: hover === 'currency' ? 1 : 0.85,
									marginTop: currencyDropdown ? -3 : 0
								}}
							/>) : null}
						</div>
						{currencyDropdown ? (
							<div
								style={{ ...styles.currencyDropdown(this.state), ...(this.props.currencyDropdownStyle || {}) }}
								ref={this.currencyDropdown}
							>
								{Object.keys(this.props.currencies).filter(symbol => {
									return !currencySearch || symbol.indexOf(currencySearch) !== -1;
								}).map(symbol => {
									return (
										<div
											key={symbol}
											id={`currency_selection_item_${symbol.toLowerCase()}`}
											style={styles.currencyDropdownItem({ hover: symbol === this.state.currencyHover })}
											onMouseOver={() => this.setState({ currencyHover: symbol })}
											onMouseOut={() => this.setState({ currencyHover: '' })}
											onClick={e => {
												e.stopPropagation();
												this.handleSelectCurrency({ currency: symbol });
											}}
										>
											{symbol}
										</div>
									);
								})}
							</div>
						) : null}
					</div>
				</div>
				{this.state.error ? (
					<div style={{ color: 'red' }}>
						Formatting Error
					</div>
				) : null}
			</div>
		);
	};
}

const styles = {

	inputContainer: {
		display: 'flex',
		border: `1px solid ${COLORS.secondary}`
	},

	inputAmount: ({ hover, focus }) => {

		return {
			background: hover === 'amount' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.025)',
			height: 40,
			paddingLeft: 12,
			paddingRight: 12,
			outline: 'none',
			border: 'none',
			color: '#fff',
			fontFamily: 'JetBrains-Mono-Regular',
			width: '100%',
			fontSize: 14
		};
	},

	inputCurrency: ({ hover, currencyDropdown }) => {

		return {
			height: 40,
			background: 'transparent',
			outline: 'none',
			border: 'none',
			fontFamily: 'JetBrains-Mono-Regular',
			width: 50,
			paddingLeft: 12,
			fontSize: 14,
			color: currencyDropdown || hover === 'currency' ? '#fff' : 'rgba(255,255,255,0.85)',
		};
	},

	currencyDropdown: ({ dropdownTop }) => {

		return {
			zIndex: 1,
			overflowY: 'scroll',
			background: 'rgb(33,34,35)',
			width: 76,
			maxHeight: 264,
			color: '#fff',
			position: 'absolute',
			fontFamily: 'JetBrains-Mono-Regular'
		};
	},

	currencyDropdownItem: ({ hover }) => {

		return {
			background: hover ? COLORS.secondary : 'transparent',
			paddingLeft: 12,
			paddingRight: 12,
			paddingTop: 3,
			paddingBottom: 0,
			cursor: 'pointer',
			userSelect: 'none',
			height: 24
		};
	}
};

export default CurrencyInput;
