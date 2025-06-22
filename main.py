# command line: uvicorn main:app --workers 1
# production: gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
# from fastapi.responses import FileResponse

from config import MEDIA_FOLDERS
from backend.fun.load import scan_media_libraries


class Query(BaseModel):
    search_query: str
    tags: list[str]
    exclude_tags: list[str]
    sortby: str
    datetime_earliest: str
    datetime_latest: str


# Startup/Shutdown logic
@asynccontextmanager
async def lifespan(app: FastAPI):
    
    print('Scanning media libraries ...')
    try:
        scan_media_libraries(MEDIA_FOLDERS)
    except KeyboardInterrupt:
        print('\n... keyboard interrupt. stopping scan.')
    
    yield
    print('FastAPI shutting down ...')



app = FastAPI(lifespan=lifespan)

# enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES

app.mount("/", StaticFiles(directory="frontend/build", html=True), name="frontend")


@app.get("/test")
async def APP_test():
    return {"response": "I'm here!"}


@app.get("/search-posts")
async def APP_search_posts(query: Query):
    return Response('Not implemented', 501)


@app.get("/get-post-info/{post_id}")
async def APP_get_post_info(post_id: str):
    return Response('Not implemented', 501)


@app.post("/media/<relative_path>")
async def APP_query_posts(relative_path: str):
    return Response('Not implemented', 501)


@app.post("/rescan-libraries")
async def APP_rescan_libraries():
    return Response('Not implemented', 501)


# run
if __name__ == '__main__':
    import uvicorn
    print('Starting uvicorn')
    uvicorn.run(
        "main:app",
        host='0.0.0.0',
        port=8000,
        workers=1,
        reload=True,
    )
