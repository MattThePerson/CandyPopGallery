package routes

import (
    "github.com/labstack/echo/v4"

    "github.com/MattThePerson/CandyPopGallery/internal"
)

// IncludeAdminRoutes
//  GET         /admin/setup-complete
//  GET|POST    /admin/config
func IncludeAdminRoutes(e *echo.Echo, app *internal.App) {

    e.GET("/admin/setup-complete", func (c echo.Context) error {
        config, err := internal.ReadConfig(app.AppDataDir)
        if err != nil {
            return handleServerError(c, 500, "failed to read config", err)
        }
        app.Config = config
        if app.Config == nil {
            return c.JSON(200, map[string]bool{"done": false})
        }
        return c.JSON(200, map[string]bool{"done": true})
    })

}
