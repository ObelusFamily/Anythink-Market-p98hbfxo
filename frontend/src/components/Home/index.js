import Banner from "./Banner";
import MainView from "./MainView";
import React from "react";
import Tags from "./Tags";
import agent from "../../agent";
import { connect } from "react-redux";
import {
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  APPLY_TAG_FILTER,
} from "../../constants/actionTypes";

const Promise = global.Promise;

const mapStateToProps = (state) => ({
  ...state.home,
  appName: state.common.appName,
  token: state.common.token,
});

const mapDispatchToProps = (dispatch) => ({
  onClickTag: (tag, pager, payload) =>
    dispatch({ type: APPLY_TAG_FILTER, tag, pager, payload }),
  onLoad: (tab, pager, payload) =>
    dispatch({ type: HOME_PAGE_LOADED, tab, pager, payload }),
  onUnload: () => dispatch({ type: HOME_PAGE_UNLOADED }),
});

class Home extends React.Component {
  state = {
    searchText: ''
  };

  componentWillMount() {
    const tab = "all";
    const itemsPromise = agent.Items.all;

    this.props.onLoad(
      tab,
      itemsPromise,
      Promise.all([agent.Tags.getAll(), itemsPromise()])
    );
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    return (
      <div className="home-page">
        <Banner>
          <input
            size='30'
            type="text"
            id="search-box"
            placeholder="What is it that you truly desire?"
            onChange={({ target: { value } }) => {
              const tab = "all";
              const itemsPromise = agent.Items.all;
              const itemsByTitlePromise = agent.Items.byTitle;          

              this.setState({ searchText: value });
              this.props.onLoad(
                tab,
                value.length > 3 ? itemsByTitlePromise : itemsPromise, 
                Promise.all([agent.Tags.getAll(), value.length > 3 ? itemsByTitlePromise(value) : itemsPromise()])
              );
            }}
            style={{ borderRadius: '10px' }}
          />
        </Banner>
        <div className="container page">
          <Tags tags={this.props.tags} onClickTag={this.props.onClickTag} />
          <MainView />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
