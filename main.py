# command line: uvicorn main:app --workers 1
# production: gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
from fastapi import FastAPI, Response, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
import os
# from fastapi.responses import FileResponse

from config import MEDIA_FOLDERS
from backend.fun.load import scan_media_libraries
import backend.db as db


class Query(BaseModel):
    search_query: str|None
    include_tags: list[str]
    exclude_tags: list[str]
    sortby: str|None
    # datetime_earliest: str
    # datetime_latest: str


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

@app.get("/api/test")
async def APP_test():
    return {"response": "Im here!"}


# TODO: find a home <3
def prune_post_object(obj):
    """ leaves only the most important data in the object """
    keys_to_keep = [
        "post_id", "source_id", "author", "media_count", "source", "title", ""
    ]
    newobj = { k: v for k, v in obj.items() if k in keys_to_keep }
    newobj["media_objects"] = [ obj["media_objects"][0] ]
    return newobj


@app.post("/api/search-posts")
async def APP_search_posts(query: Query):
    print(query)
    posts_dict = db.read_table_as_dict('posts')
    post_objects = [ prune_post_object(obj) for obj in posts_dict.values() ]
    return { "posts": post_objects }


@app.get("/api/get-post-data/{post_id}")
async def APP_get_post_info(post_id: str):
    print('getting post with id:', post_id)
    post_object = db.read_object_from_db(post_id, 'posts')
    if post_object is None:
        return HTTPException(status_code=404, detail=f"No post with id: {post_id}")
    return post_object


@app.get("/media/{relative_path:path}")
async def APP_query_posts(relative_path: str):
    print("relpath:", relative_path)
    for basedir in MEDIA_FOLDERS:
        media_path = basedir + '/' + relative_path
        if os.path.isfile(media_path):
            return FileResponse(media_path)
    raise HTTPException(status_code=404, detail="File not found")


@app.get("/control/rescan-libraries")
async def APP_rescan_libraries():
    print('Rescanning!')
    return {'stuff': "here"}
    # return Response('Here your dirty pic', 200)


app.mount("/", StaticFiles(directory="frontend/build", html=True), name="frontend")


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
