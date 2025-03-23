FROM python:3.12.3 AS build

WORKDIR /app

RUN curl -sSL https://install.python-poetry.org | python3 - 
ENV PATH="/root/.local/bin:$PATH"

COPY . /app
COPY pyproject.toml poetry.lock /app/

RUN chmod +x /app/run.sh

RUN \
      poetry config virtualenvs.create false && \
      poetry install --no-root --without dev

EXPOSE 8000

CMD ["/app/run.sh"]
