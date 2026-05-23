package main

import (
    "flag"
    "fmt"
    "strings"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"

    "github.com/MattThePerson/CandyPopGallery/internal"
    "github.com/MattThePerson/CandyPopGallery/internal/routes"
)

var (
    devMode    = flag.Bool("dev", false, "use dev mode")
    serverPort = flag.Int("port", 8020, "server port")
)

func NoCacheMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
    return func(c echo.Context) error {
        err := next(c)
        path := c.Request().URL.Path
        if strings.HasSuffix(path, ".html") || strings.HasSuffix(path, ".js") || strings.HasSuffix(path, ".css") {
            c.Response().Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
            c.Response().Header().Set("Pragma", "no-cache")
            c.Response().Header().Set("Expires", "0")
        }
        return err
    }
}

func main() {

    flag.Parse()

    app, close_db_func := internal.LoadApp(*serverPort)
    defer close_db_func()

    e := echo.New()

    // Middleware
    e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
        Format: "${method} ${uri} ${status} ${latency_human}\n",
    }))
    e.Use(middleware.Recover())

    if *devMode {
        fmt.Println("[GO] Using NoCacheMiddleware")
        e.Use(NoCacheMiddleware)
    }

    // routes
    routes.IncludeApiRoutes(e, &app)
    routes.IncludeAdminRoutes(e, &app)

    // Serve frontend with SPA fallback to index.html
    e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
        Root:   "frontend/dist",
        Index:  "index.html",
        HTML5:  true,
        Browse: false,
    }))

    addr := fmt.Sprintf(":%d", *serverPort)
    e.Logger.Fatal(e.Start(addr))
}
