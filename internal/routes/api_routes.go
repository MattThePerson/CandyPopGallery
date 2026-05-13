package routes

import (
    "fmt"
    "github.com/labstack/echo/v4"

    "github.com/MattThePerson/CandyPopGallery/internal"
)

// IncludeApiRoutes
//
//  GET     /api/hello-there    # General Kenobi!
//  GET     /api/greet/:name
func IncludeApiRoutes(e *echo.Echo, app *internal.App) {

    e.GET("/api/hello-there", func(c echo.Context) error {
        return c.String(200, "General Kenobi!")
    })

    e.GET("/api/greet/:name", func(c echo.Context) error {
        name := c.Param("name")
        fmt.Println("In ECHO_hello: " + name)
        msg := "Helo " + name
        return c.String(200, msg)
    })

}
