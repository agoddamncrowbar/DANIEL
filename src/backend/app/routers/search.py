from fastapi import APIRouter

@router.get("/search/insights")
def search_insights(db: Session = Depends(get_db)):
    from sqlalchemy import func

    # Popular searches
    popular = (
        db.query(
            SearchQuery.query,
            func.count(SearchQuery.id).label("freq")
        )
        .group_by(SearchQuery.query)
        .order_by(func.count(SearchQuery.id).desc())
        .limit(10)
        .all()
    )

    # Convert popular searches
    popular_searches = [
        {"term": q, "count": freq} for q, freq in popular
    ]

    # Suggested searches (simple heuristic: queries with few results)
    suggested = (
        db.query(SearchQuery.query)
        .filter(SearchQuery.results_count < 3)  # "low result" queries
        .group_by(SearchQuery.query)
        .order_by(func.count(SearchQuery.id).desc())
        .limit(10)
        .all()
    )

    suggested_terms = [q for (q,) in suggested]

    return {
        "popular_searches": popular_searches,
        "suggested_searches": suggested_terms,
    }
