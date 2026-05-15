package routes

import (
	"fmt"
	"log"
	"github.com/labstack/echo/v4"
)

func handleServerError(c echo.Context, status int, msg string, err error) error {
	server_prefix := "🚨🚨 ERROR 🚨🚨: "
	route := c.Path()
	err_msg := fmt.Sprintf("%s: %s", msg, err.Error())
	log.Printf("%s [%s] %s", server_prefix, route, err_msg)
	return c.String(status, err_msg)
}

func handleOK(c echo.Context) error {
    return c.JSON(200, map[string]bool{"ok": true})
}
