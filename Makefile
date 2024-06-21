.PHONY: serve
server:
	@echo "Starting the Python server..."
	@python3 -m http.server &
	@sleep 2
	@echo "Opening the default web browser..."
	@open -a "Google Chrome" http://localhost:8000

stop:
	@echo "Stopping the Python server..."
	lsof -i :8000 | awk 'NR>1 {print $$2}' | xargs kill -9