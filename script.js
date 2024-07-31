const { useState, useEffect } = React;
const { BrowserRouter, Route, Switch, Link, useParams, useHistory, useLocation, NavLink } = ReactRouterDOM;
const { fetchVideos, fetchUserChannels, blockChannel, unblockChannel, fetchKeywords, addKeyword, deleteKeyword, createStory, fetchStories } = window.api;


const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const history = useHistory();

  const handleSearch = (e) => {
    e.preventDefault();
    history.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <form className="d-flex" onSubmit={handleSearch}>
      <input
        className="form-control me-2"
        type="search"
        placeholder="Search"
        aria-label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className="btn btn-outline-light" type="submit">
        <i className="bi bi-search"></i>
      </button>
    </form>
  );
};

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  return (
    <nav className="navbar navbar-dark">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="icon-192x192.png" alt="Reo Logo" className="brand-logo me-2" />
          Reo
        </Link>
        {isHomePage && <SearchBar />}
      </div>
    </nav>
  );
};

const VideoCard = ({ video }) => {
  const history = useHistory();

  const handleClick = () => {
    history.push(`/video/${video.external_id}`);
  };

  return (
    <div className="card h-100" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="video-thumbnail-container">
        <img src={video.thumbnailUrl} className="card-img-top video-thumbnail" alt={video.title} loading="lazy" />
      </div>
      <div className="card-body">
        <h5 className="card-title">{video.title}</h5>
      </div>
    </div>
  );
};

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadVideos = async (page) => {
    try {
      setLoading(true);
      const fetchedVideos = await fetchVideos(page, pageSize);
      if (fetchedVideos.length < pageSize) {
        setHasMore(false);
      }
      setVideos((prevVideos) => [...prevVideos, ...fetchedVideos]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos(page);
  }, [page]);

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="container mt-3">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {videos.map((video) => (
          <div className="col" key={video.external_id}>
            <VideoCard video={video} />
          </div>
        ))}
      </div>
      {hasMore && !loading && (
        <button className="load-more-button" onClick={handleLoadMore}>
          Load More
        </button>
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
};

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedVideos = await fetchVideos();
        const selectedVideo = fetchedVideos.find((video) => video.external_id === id);
        if (selectedVideo) {
          setVideo(selectedVideo);
        } else {
          throw new Error('Video not found');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (!video) return <div className="container mt-4">Video not found</div>;

  return (
    <div className="container mt-4 video-detail-container">
      <div className="video-embed-wrapper mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${video.external_id}`}
          title={video.title}
          allowFullScreen
          className="video-embed"
        ></iframe>
      </div>
      <h1 className="video-title mb-2">{video.title}</h1>
      <p>{video.description}</p>
    </div>
  );
  };


const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    if (searchTerm) {
      performSearch();
    }
  }, [searchTerm]);

  const performSearch = async () => {
    try {
      const fetchedVideos = await fetchVideos();
      const filteredVideos = fetchedVideos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredVideos);
    } catch (error) {
      console.error('Error searching videos:', error);
    }
  };

  return (
    <div className="container mt-3">
      <h2>Search Results for "{searchTerm}"</h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {searchResults.map(video => (
          <div className="col" key={video.video_id}>
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
};


const KeywordManager = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const response = await fetchKeywords();
      setKeywords(response);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;
    try {
      const response = await addKeyword({ word: newKeyword.trim() });
      setNewKeyword('');
      loadKeywords(); // Reload keywords after adding
    } catch (error) {
      console.error('Error adding keyword:', error);
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    try {
      await deleteKeyword(keywordId);
      loadKeywords(); // Reload keywords after deleting
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="keyword-manager">
      <h2>Manage Keywords</h2>
      {keywords.length > 0 ? (
        <ul>
          {keywords.map(keyword => (
            <li key={keyword.id}>
              {keyword.word}
              <button onClick={() => handleDeleteKeyword(keyword.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No keywords added yet.</p>
      )}
      <div className="add-keyword">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add a new keyword"
        />
        <button onClick={handleAddKeyword}>Add Keyword</button>
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <div className="container mt-4">
      <h1>Settings</h1>
      <KeywordManager />
    </div>
  );
};

const characterOptions = [
  { id: 'Bluey', name: 'Bluey' },
  { id: 'Peppa Pig', name: 'Peppa Pig' },
  { id: 'Curious George', name: 'Curious Georg' },
  { id: 'Daniel Tiger', name: 'Daniel Tiger' },
  { id: 'Ben and Holly', name: 'Ben and Holly' },
];


const CreateComponent = () => {
  const [topic, setTopic] = useState("");
  const [characters, setCharacters] = useState([]);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const requestBody = {
      topic,
      characters: characters,
      duration
    };
    try {
      const result = await createStory(requestBody);
      setAudioUrl(result.audio_url);
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating story: " + error.message);
    }
  };
  const handleCharacterChange = (e) => {
    const selectedOptions = [...e.target.selectedOptions].map(option => option.value);
    setCharacters(selectedOptions);
  };
  return (
    <div className="create-container">
      <h2>Create a New Story</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Topic</label>
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Characters</label>
          <select 
            multiple 
            value={characters}
            onChange={handleCharacterChange}
            required
          >
            {characterOptions.map(character => (
              <option key={character.id} value={character.name}>{character.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Duration (minutes)</label>
          <input 
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-custom">Create Story</button>
      </form>
      {audioUrl && (
        <div className="audio-player">
          <h3>Generated Story</h3>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
};

const BottomNav = () => {
  const location = useLocation();
  return (
    <div className="bottom-nav">
      <NavLink exact to="/" className="nav-item" activeClassName="active">
        <i className="bi bi-house"></i> Home
      </NavLink>
      <NavLink to="/create" className="nav-item" activeClassName="active">
        <i className="bi bi-plus-circle"></i> Create
      </NavLink>
      <NavLink to="/settings" className="nav-item" activeClassName="active">
        <i className="bi bi-gear"></i> Settings
      </NavLink>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <div style={{ paddingBottom: '60px' }}>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/video/:id" component={VideoDetail} />
        <Route path="/search" component={Search} />
        <Route path="/create" component={CreateComponent} />
        <Route path="/settings" component={Settings} />
      </Switch>
      <BottomNav />
    </div>
  </BrowserRouter>
);

ReactDOM.render(React.createElement(App), document.getElementById('root'));