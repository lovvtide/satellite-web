import React, { PureComponent } from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

import { COLORS } from '../../../constants';


class AdminEditor extends PureComponent {

  state = {
    name: '',
    image: '',
    description: '',
    rules: '',
    moderators: [],
    rankMode: 'votes', // 'votes', 'zaps'
    //rankBatch: 0
  };

  componentDidMount = () => {

    if (this.props.createNew) {

      this.setState({
        rankMode: 'votes',
        rankBatch: 20,
        moderators: [
          this.props.pubkey
        ]
      });

    } else if (this.props.editing) { // editing existing

      const set = {
        name: this.props.editing.name || '',
        image: this.props.editing.image || '',
        description: this.props.editing.description || '',
        rules: this.props.editing.rules || '',
        moderators: this.props.editing.moderators || [],
        rankMode: this.props.editing.rankMode || 'votes'
      };

      if (typeof this.props.editing.rankBatch === 'undefined') {
        set.rankBatch = 20;
      } else {
        set.rankBatch = parseInt(this.props.editing.rankBatch);
      }

      this.setState(set);
    }   
  };

  handleAddModeratorInput = (e) => {

    const { value } = e.target;

    if (value && value.substring(0, 5) === 'npub1' && value.length === 63) {

      let pubkey;

      try {

        const decoded = nip19.decode(value);

        if (decoded.type === 'npub') {

          pubkey = decoded.data;
        }

      } catch (err) {
        console.log(err);
      }

      if (pubkey) {

        if (this.state.moderators.indexOf(pubkey) === -1) {

          this.setState({
            addModerator: false,
            moderators: [
              ...this.state.moderators,
              pubkey
            ]
          });

        } else {

          this.setState({
            addModerator: false
          });
        }
      }

    } else {

      this.setState({ add: value });
    }
  };

  handleRemoveModerator = (remove) => {

    this.setState({
      moderators: this.state.moderators.filter(pubkey => {
        return pubkey !== remove;
      })
    });
  };

  handleNameChange = ({ target }) => {

    this.setState({
      name: target.value.split('').filter(c => {
        return c !== ' ';
      }).join('')
    });
  };

  handleImageChange = ({ target }) => {

    this.setState({
      image: target.value
    });
  };

  handleDescriptionChange = ({ target }) => {

    this.setState({
      description: target.value
    });
  };

  handleRulesChange = ({ target }) => {

    this.setState({
      rules: target.value
    });
  };

  handleSelectRankMode = (rankMode) => {

    this.setState({ rankMode });
  };

  handleRankBatchChange = ({ target }) => {

    const { value } = target;
    const numerals = '0123456789';

    for (let c of value) {
      if (numerals.indexOf(c) === -1) {
        return;
      }
    }

    this.setState({
      rankBatch: value === '' ? 0 : parseInt(value)
    });
  };

  render = () => {

    const { mobile } = this.props;

    return (
      <div style={{ maxWidth: 612, paddingBottom: 120, whiteSpace: 'break-spaces' }}>
        {this.props.createNew ? (<div style={styles.section(this.props)}>
          <div style={styles.label}>Name</div>
          <div style={mobile ? undefined : styles.content}>
            <div style={styles.description}>
              What should your community be called? (no spaces)
            </div>
            <input
              disabled={!this.props.createNew}
              onChange={this.handleNameChange}
              placeholder='e.g. programming'
              value={this.state.name}
              style={styles.input}
            />
          </div>
        </div>) : null}
        <div style={styles.section(this.props)}>
          <div style={styles.label}>Banner Image</div>
          <div style={mobile ? undefined : styles.content}>
            <div style={styles.description}>
              Please provide a URL for your community's banner image 
            </div>
            {this.state.image ? (
              <img
                src={this.state.image}
                style={{
                  //backgroundImage: `url(${this.state.image})`,
                  //backgroundPosition: 'center center',
                  //backgroundSize: 'cover',
                  position: 'relative',
                  width: '100%'
                  //height: 120
                }}
              />
            ) : null}
            <input
              placeholder='https://nostr.build...jpg'
              value={this.state.image}
              style={styles.input}
              onChange={this.handleImageChange}
            />
          </div>
        </div>
        <div style={styles.section(this.props)}>
          <div style={styles.label}>Description</div>
          <div style={mobile ? undefined : styles.content}>
            <div style={styles.description}>
              What is this community about? What is its purpose?
            </div>
            <textarea
              onChange={this.handleDescriptionChange}
              value={this.state.description}
              rows={7}
              style={{ ...styles.input, lineHeight: '21px' }}
            />
          </div>
        </div>
        <div style={styles.section(this.props)}>
          <div style={styles.label}>Posting Guidelines</div>
          <div style={mobile ? undefined : styles.content}>
            <div style={styles.description}>
              What are the rules for posting in this community, if any?
            </div>
            <textarea
              onChange={this.handleRulesChange}
              value={this.state.rules}
              rows={7}
              style={{ ...styles.input, lineHeight: '21px' }}
            />
          </div>
        </div>
        <div style={styles.section(this.props)}>
          <div style={styles.label}>Moderators</div>
          <div style={mobile ? undefined : styles.content}>
            <div style={styles.description}>
              As the founder of this community, you are its first moderator by
              default. You can appoint additional moderators now or later by
              specifying each person's npub.
            </div>
            <div>
              {this.state.moderators.map(pubkey => {
                const npub = nip19.npubEncode(pubkey);
                return (
                  <div
                    key={pubkey}
                    style={{
                      fontFamily: 'JetBrains-Mono-Regular',
                      display: 'flex',
                      height: mobile ? 32 : 24,
                      alignItems: 'center',
                      color: COLORS.blue
                    }}
                  >
                    <Icon
                      name='flag outline'
                      style={{
                        height: 20,
                        marginRight: 7,
                        fontSize: mobile ? 15 : 13
                      }}
                    />
                    <Link to={`/@${npub}`}>
                      <span style={{ fontSize: mobile ? 14 : 12 }}>
                        {npub.substring(0, 9) + '...' + npub.slice(-4)}
                      </span>
                    </Link>
                    {pubkey === this.props.pubkey ? null : (<span
                      onMouseOver={() => this.setState({ hover: 'removemod_' + pubkey })}
                      onMouseOut={() => this.setState({ hover: '' })}
                      onClick={() => this.handleRemoveModerator(pubkey)}
                      style={{
                        color: COLORS.secondaryBright,
                        opacity: this.state.hover === ('removemod_' + pubkey) ? 1 : 0.85,
                        fontFamily: 'JetBrains-Mono-Regular',
                        textTransform: 'uppercase',
                        fontSize: mobile ? 13 : 11,
                        cursor: 'pointer',
                        userSelect: 'none',
                        marginLeft: 12
                      }}
                    >
                      <Icon name='minus circle' />
                      Remove
                    </span>)}
                  </div>
                );
              })}
              <div style={{
                marginTop: 10
              }}>
                {this.state.addModerator ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: -3
                  }}>
                    <input
                      onChange={this.handleAddModeratorInput}
                      //value={this.state.add}
                      placeholder={`moderator's npub`}
                      style={{
                        maxWidth: 476,
                        height: mobile ? 42 : 36,
                        width: '100%',
                        background: 'rgba(47, 54, 61, 0.25)',
                        outline: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: mobile ? 14 : 12,
                        borderRadius: 5,
                        paddingLeft: 12,
                        paddingRight: 12,
                        fontFamily: 'JetBrains-Mono-Regular'
                      }}
                    />
                    <span
                      onMouseOver={() => this.setState({ hover: 'canceladdmod' })}
                      onMouseOut={() => this.setState({ hover: '' })}
                      onClick={() => this.setState({ addModerator: false })}
                      style={{
                        opacity: this.state.hover === 'canceladdmod' ? 1 : 0.85,
                        fontFamily: 'JetBrains-Mono-Regular',
                        textTransform: 'uppercase',
                        fontSize: mobile ? 13 : 11,
                        cursor: 'pointer',
                        userSelect: 'none',
                        marginLeft: 12
                      }}
                    >
                      Cancel
                    </span>
                  </div>
                ) : (
                  <span
                    onMouseOver={() => this.setState({ hover: 'addmod' })}
                    onMouseOut={() => this.setState({ hover: '' })}
                    onClick={() => this.setState({ addModerator: true })}
                    style={{
                      opacity: this.state.hover === 'addmod' ? 1 : 0.85,
                      fontFamily: 'JetBrains-Mono-Regular',
                      textTransform: 'uppercase',
                      fontSize: mobile ? 13 : 11,
                      cursor: 'pointer',
                      userSelect: 'none',
                      marginLeft: 1
                    }}
                  >
                    <Icon name='plus' />
                    Add Moderator
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={styles.section(this.props)}>
          <div style={styles.label}>VOTING CONFIGURATION</div>
          <div style={mobile ? undefined : styles.content}>
            <div style={styles.description}>
              Choose how content is ranked in this community. Ranking posts by "votes"
              means that readers can upvote/downvote posts just like Reddit. Alternatively,
              choosing "zaps" makes it so users must zap a post to upvote and causes posts
              to sorted by the amount of sats received.
            </div>
            <div
              style={{
                display: 'flex',
                cursor: 'pointer',
                marginBottom: 12
              }}
            >
              <div style={{
                fontStyle: 'italic',
                marginRight: 12,
                color: COLORS.secondaryBright,
                fontSize: 13,
                whiteSpace: 'nowrap'
              }}>
                Rank posts by:
              </div>
              <label
                style={{
                  display: 'flex',
                  marginRight: 12
                }}
              >
                <input
                  onClick={() => this.handleSelectRankMode('votes')}
                  checked={this.state.rankMode === 'votes'}
                  type='checkbox'
                  style={{
                    marginRight: 4,
                    cursor: 'pointer'
                  }}
                />
                <span
                  style={{
                    userSelect: 'none',
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: this.state.rankMode === 'votes' ? '#fff' : 'rgba(255,255,255,0.85)'
                  }}
                >
                  VOTES
                </span>
              </label>
              <label
                style={{
                  display: 'flex',
                  cursor: 'pointer'
                }}
              >
                <input
                  onClick={() => this.handleSelectRankMode('zaps')}
                  checked={this.state.rankMode === 'zaps'}
                  type='checkbox'
                  style={{
                    marginRight: 4,
                    cursor: 'pointer'
                  }}
                />
                <span
                  style={{
                    userSelect: 'none',
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: this.state.rankMode === 'zaps' ? '#fff' : 'rgba(255,255,255,0.85)'
                  }}
                >
                  ZAPS
                </span>
              </label>
            </div>
            <div style={styles.description}>
              Choose the number of recent posts to surface. If you choose a value of zero,
              your community will display a list of the *all time* top-ranked posts. For most
              communities, it's probably best to choose a smaller value to ensure that the top
              posts "turnover" with fresh content.
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <div
                style={{
                  fontStyle: 'italic',
                  marginRight: 12,
                  color: COLORS.secondaryBright,
                  fontSize: 13,
                  whiteSpace: 'nowrap'
                }}
              >
                Recent batch size:
              </div>
              <input
                onChange={this.handleRankBatchChange}
                placeholder='0'
                value={this.state.rankBatch || ''}
                style={{
                  ...styles.input,
                  maxWidth: 96
                }}
              />
            </div>
          </div>
        </div>
        {/*<div>
          Preferred Relays
        </div>*/}
        <div style={{
          display: 'flex',
          justifyContent: 'right',
          paddingTop: 24
        }}>
          <div
            onClick={() => this.props.handlePublishCommunity(this.state)}
            onMouseOver={() => this.setState({ hover: 'publish' })}
            onMouseOut={() => this.setState({ hover: '' })}
            style={{
              color: this.state.hover === 'publish' ? 'rgba(255,255,255)' : 'rgba(255,255,255,0.85)',
              cursor: 'pointer',
              padding: '8px 14px',
              fontSize: 12,
              userSelect: 'none',
              border: `0.5px solid ${COLORS.satelliteGold}`,
              borderRadius: 5,
              fontFamily: 'JetBrains-Mono-Bold'
            }}
          >
            {this.props.createNew ? 'PUBLISH COMMUNITY' : 'UPDATE COMMUNITY'}
          </div>
        </div>
      </div>
    );
  };
}

const styles = {

  content: {
    // paddingLeft: 12,
    // borderLeft: '6px solid rgb(29, 30, 31)'
  },

  section: ({ mobile }) => {
    return {
      marginBottom: 24,
      paddingBottom: 24,
      marginRight: mobile ? -12 : -24,
      marginLeft: mobile ? -12 : -24,
      paddingRight: mobile ? 12 : 24,
      paddingLeft: mobile ? 12 : 24,
      borderBottom: `1px dotted ${COLORS.secondary}`,
    };
  },

  label: {
    color: COLORS.satelliteGold,
    fontSize: 12,
    fontFamily: 'JetBrains-Mono-Bold',
    textTransform: 'uppercase',
    marginBottom: 4
  },

  input: {
    fontFamily: 'JetBrains-Mono-Regular',
    width: '100%',
    background: 'rgba(47, 54, 61, 0.25)',
    border: `1px dotted ${COLORS.secondary}`,
    outline: 'none',
    color: 'rgba(255,255,255,0.85)',
    padding: 12,
    fontSize: 13
  },

  description: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginBottom: 12
  }
};

export default AdminEditor;
