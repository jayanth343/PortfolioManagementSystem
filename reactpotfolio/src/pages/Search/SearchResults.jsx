import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);

    useEffect(() => {
        // Mock search logic placeholder
        if (query) {
            console.log("Searching for:", query);
            // Future API call goes here
        }
    }, [query]);

    return (
        <div className="search-results-page" style={{ padding: '20px 40px' }}>
            <h2 style={{ marginBottom: '20px' }}>Search Results</h2>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                {query ? (
                    <span>Results for <strong style={{ color: 'white' }}>"{query}"</strong></span>
                ) : (
                    <span>No search query provided</span>
                )}
            </div>

            <div style={{
                padding: '40px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px dashed #333'
            }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🔍</span>
                <p>Search functionality is implemented for navigation.</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Results display coming in next phase.</p>
            </div>
        </div>
    );
};

export default SearchResults;
