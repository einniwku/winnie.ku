<%@ Page Language="C#" %>
<script runat="server">
    protected void Page_Load(object sender, EventArgs e) {
        Response.Redirect("main.aspx" + Request.Url.Query);
    }
</script>
