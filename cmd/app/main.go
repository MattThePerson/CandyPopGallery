package main

import (
	"flag"
	"fmt"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

	// Get config variables
	var config Config = GetConfig("config.yaml")

	fmt.Println(config.MediaFolders) // TODO: Remove!

	// Echo instance
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

	// hello there
	e.GET("/hello", func(c echo.Context) error {
		return c.String(200, "General Kenobi!")
	})

	// get port
	e.GET("/api/get-port", func(c echo.Context) error {
		return c.String(200, (string)(*serverPort))
	})

	// Static folders
	e.Static("/", "frontend")

	addr := fmt.Sprintf(":%d", *serverPort)
	e.Logger.Fatal(e.Start(addr))

}
