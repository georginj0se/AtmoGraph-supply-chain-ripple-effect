# NLP Pipeline

The NLP engine turns news text into risk scores on the supply chain graph.

## Flow

1. News headlines are read from news_sample.txt.
2. spaCy (en_core_web_sm) finds places in each headline using Named Entity Recognition.
3. A rule based scorer rates the news: strike, shutdown or closure is 0.9, congestion or delay is 0.6, and news that says reopened or called off is 0.1.
4. The place is matched to a port in Neo4j using port_city_map.json.
5. The port risk_score is updated in Neo4j.
6. The risk ripples to plants hosted at that port (70 percent of the port risk) and to customers those plants supply (50 percent of the plant risk).
7. risk.json is exported for the React dashboard, which shows risky nodes in red and magenta.

## Notes

- The headlines are samples written for the project, not live news.
- The dataset only has port codes, so each port was assigned a real city for the demo.
- The Neo4j password is entered at run time with getpass and is never stored in the notebook.
