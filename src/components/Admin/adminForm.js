import React, { useState, useEffect } from 'react';

import { API, Storage } from 'aws-amplify';

import { listCategorys,listLanguages,listMasters } from '../../graphql/queries';
import { createMaster as createMasterMutation } from '../../graphql/mutations';

import TextField from '@material-ui/core/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import './admin.css'
import { textAlign } from '@mui/system';
const banner = require('../../Assets/images/adminBanner.jpg')
const useStyles = makeStyles({
    root: {
        width: "100%",
    },
    outerDiv: {
        height: 'auto',
    },
    bannerImage: {
        width: "100%",
        height: "933px",
    },
    gridContainer: {
        padding: "10% 0",
        backgroundColor:"#ddd"
    },
    gridItem: {
        marginBottom: "3%",
        marginLeft:"10%",
        width:'80%',
        textAlign:"left"
    },
    itemContainer:{
        position:"absolute",
        top:'14%',
        left:'15%',
        width:'38%',
        height:"60%",
        backgroundColor:'#000',
        border:'1px solid #fff',
        overflow:'scroll',
        overflowX:'hidden',
        padding:'0 1%',
        '& div':{
            width:'100%',
            borderBottom:'1px solid #fff'
        },
        '& p':{
            color:'#fff',
            textAlign:'left'
        }
    }
});

const initialFormState = { Title: "", Video: "Upload audio file", Image: "Upload thumbnail", CategoryId: "",Language:"" };
export default function AdminPanel(props) {
    const classes = useStyles();

    const [categories, setCategories] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [masterFormData, setMasterformdata] = useState(initialFormState);
    const [masterData, setmasterData] = useState([])

    useEffect(() => {
        fetchMaster();
        fetchCategories();
        fetchLanguages();
    }, []);
    async function fetchMaster() {
        const apiData = await API.graphql({ query: listMasters });
        let masterData = apiData.data.listMasters.items;
        masterData = masterData.sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1);
        setmasterData(apiData.data.listMasters.items);
    }
    async function fetchCategories() {
        const apiData = await API.graphql({ query: listCategorys });
        let categories = [];
        apiData.data.listCategorys.items.map((category) => {
            categories.push({
                "value": category.name,
                "label": category.id
            })
        })
        setCategories(categories);
    }
    async function fetchLanguages() {
        const apiData = await API.graphql({ query: listLanguages });
        let languages = [];
        apiData.data.listLanguages.items.map((language) => {
            languages.push({
                "value": language.name,
                "label": language.id
            })
        })
        setLanguages(languages);
    }
    const handleChange = (event) => {
        setMasterformdata({ ...masterFormData, CategoryId: event.target.value })
    };
    const handlelangChange = (event) => {
        setMasterformdata({ ...masterFormData, Language: event.target.value })
    };
    async function uploadAudioFile(e) {
        if (!e.target.files[0]) return
        const file = e.target.files[0];
        setMasterformdata({ ...masterFormData, Video: file.name });
        await Storage.put(file.name, file);
    }
    async function uploadThumbnail(e) {
        if (!e.target.files[0]) return
        const file = e.target.files[0];
        setMasterformdata({ ...masterFormData, Image: file.name });
        await Storage.put(file.name, file);
    }
    async function createMaster() {
        if (!masterFormData.Title) return;
        await API.graphql({ query: createMasterMutation, variables: { input: masterFormData } });
        if (masterFormData.Video) {
            const image = await Storage.get(masterFormData.Video);
            masterFormData.Video = image;
        }
        setmasterData([...masterData,masterFormData]);
        setMasterformdata(initialFormState);
    }
    const Cancel = () => {
        setMasterformdata(initialFormState);
    };
    return (
        <div className={classes.outerDiv}>
            <Grid container>
                <Grid xs={12} lg={8} md={6} sm={6}>
                    <div><img src={banner} className={classes.bannerImage} /></div>
                    <div className={classes.itemContainer}>
                    {
                        masterData.map((item,index)=>{
                            return(
                                <div><p>{item.Title}</p><p>{item.Video}</p></div>
                            );
                        })
                    }
                    </div>
                </Grid>
                <Grid className={classes.gridContainer} xs={12} lg={4} md={6} sm={6}>
                    <Grid item xs={12} lg={12} md={12} sm={12} className={classes.gridItem}>
                        <TextField className={classes.root} id="standard-basic" label="Title" value={masterFormData.Title} onChange={t => { setMasterformdata({ ...masterFormData, Title: t.target.value }) }} />
                    </Grid>
                    <Grid item xs={12} lg={12} md={12} sm={12} className={classes.gridItem}  ><TextField
                        className={classes.root}
                        id="standard-select-category"
                        select
                        label="Select"
                        value={masterFormData.CategoryId}
                        onChange={handleChange}
                        // helperText="Please select your currency"
                        variant="standard"
                    >
                        {categories.map((option) => (
                            <MenuItem key={option.label} value={option.label}>
                                {option.value}
                            </MenuItem>
                        ))}
                    </TextField></Grid>
                    <Grid item xs={12} lg={12} md={12} sm={12} className={classes.gridItem}  ><TextField
                        className={classes.root}
                        id="standard-select-language"
                        select
                        label="Select language"
                        value={masterFormData.Language}
                        onChange={handlelangChange}
                        variant="standard"
                    >
                        {languages.map((option) => (
                            <MenuItem key={option.label} value={option.value}>
                                {option.value}
                            </MenuItem>
                        ))}
                    </TextField></Grid>
                    <Grid item xs={12} lg={12} md={12} sm={12} className={classes.gridItem}  >
                        <Button variant="contained" component="label"><input className={classes.root} type="file" label="Audio file" onChange={uploadAudioFile} hidden /><UploadFileOutlinedIcon />{masterFormData.Video}</Button>
                    </Grid>
                    <Grid item xs={12} lg={12} md={12} sm={12} className={classes.gridItem} >
                        <Button variant="contained" component="label">
                            <input className={classes.root} type="file" label="Thumbnail" onChange={uploadThumbnail} hidden />
                            <UploadFileOutlinedIcon />{masterFormData.Image}</Button>
                    </Grid>

                    <Grid xs={12} lg={12} md={12} sm={12} className={classes.gridItem}>
                        <Button variant="contained" onClick={createMaster}>Add file</Button>
                        <Button variant="contained" onClick={Cancel}>Cancel</Button>
                    </Grid>
                    <Grid xs={12} lg={12} md={12} sm={12}>
                        <Button variant="contained" onClick={e => props.activeView(e, "Home")}>View Items</Button>
                    </Grid>

                </Grid>
            </Grid>
        </div>
    );
}
